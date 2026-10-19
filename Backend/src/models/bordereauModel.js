import db from '../config/db.js';

const CODES_STATUT = {
  BROUILLON: 'BROUILLON',
  EMIS: 'EMIS',
  RECU_PAR_DIVISION: 'RECU_PAR_DIVISION',
  ARCHIVE: 'ARCHIVE',
};

export const STATUTS_BORDEREAU = Object.values(CODES_STATUT);

/**
 * Génère un numéro de référence unique : BORD-ANNEE-XXXXXX
 */
export async function genererReference() {
  const annee = new Date().getFullYear();
  const [row] = await db.query(
    `SELECT COUNT(*) AS n FROM bordereaux WHERE reference LIKE ?`,
    [`BORD-${annee}-%`]
  );
  const seq = (row.n || 0) + 1;
  return `BORD-${annee}-${String(seq).padStart(6, '0')}`;
}

/**
 * Liste paginée avec filtres (division, statut, recherche)
 */
export async function findAll({ page = 1, limit = 25, division_id, statut, search } = {}) {
  const offset = (page - 1) * limit;
  const where = ['1=1'];
  const params = [];

  if (division_id) {
    where.push('b.division_id = ?');
    params.push(division_id);
  }
  if (statut) {
    where.push('b.statut = ?');
    params.push(statut);
  }
  if (search) {
    where.push('(b.reference LIKE ? OR b.observation LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereSQL = where.join(' AND ');

  const [total] = await db.query(
    `SELECT COUNT(*) AS total FROM bordereaux b WHERE ${whereSQL}`,
    params
  );

  const rows = await db.query(
    `SELECT b.*, dv.nom AS division_nom,
            a.nom AS agent_nom, a.prenom AS agent_prenom,
            r.nom AS recu_par_nom, r.prenom AS recu_par_prenom
     FROM bordereaux b
     JOIN divisions dv ON dv.id = b.division_id
     LEFT JOIN agents a ON a.id = b.agent_id
     LEFT JOIN agents r ON r.id = b.recu_par
     WHERE ${whereSQL}
     ORDER BY b.date_transmission DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { data: rows, total: total.total, page, limit };
}

/**
 * Détail d'un bordereau avec sa liste de dossiers
 */
export async function findById(id) {
  const [b] = await db.query(
    `SELECT b.*, dv.nom AS division_nom, dv.code AS division_code,
            a.id AS agent_id, a.nom AS agent_nom, a.prenom AS agent_prenom,
            r.id AS recu_par_id, r.nom AS recu_par_nom, r.prenom AS recu_par_prenom
     FROM bordereaux b
     JOIN divisions dv ON dv.id = b.division_id
     LEFT JOIN agents a ON a.id = b.agent_id
     LEFT JOIN agents r ON r.id = b.recu_par
     WHERE b.id = ?`,
    [id]
  );
  if (!b) return null;

  const dossiers = await db.query(
    `SELECT d.id, d.numero, d.objet, d.statut_id, s.code AS statut_code, s.libelle AS statut_libelle,
            d.demandeur, d.division_id, bd.ordre
     FROM bordereaux_dossiers bd
     JOIN dossiers d ON d.id = bd.dossier_id
     JOIN statuts_dossiers s ON s.id = d.statut_id
     WHERE bd.bordereau_id = ?
     ORDER BY bd.ordre, d.numero`,
    [id]
  );

  return { ...b, dossiers };
}

/**
 * Crée un bordereau (statut BROUILLON)
 */
export async function create({ division_id, agent_id, observation, dossiers }) {
  const reference = await genererReference();

  const result = await db.query(
    `INSERT INTO bordereaux (reference, division_id, agent_id, observation, statut)
     VALUES (?, ?, ?, ?, 'BROUILLON')`,
    [reference, division_id, agent_id || null, observation || null]
  );

  const insertId = result.insertId;

  if (dossiers?.length) {
    const values = dossiers.map((d, idx) => [insertId, d.id, d.ordre ?? idx]);
    await db.query(
      `INSERT INTO bordereaux_dossiers (bordereau_id, dossier_id, ordre) VALUES ?`,
      [values]
    );
  }

  return findById(insertId);
}

/**
 * Met à jour un bordereau (champs partiels)
 */
export async function update(id, data) {
  const allowed = ['division_id', 'observation', 'statut'];
  const sets = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`b.${key} = ?`);
      params.push(data[key]);
    }
  }
  if (!sets.length) return findById(id);

  params.push(id);
  await db.query(`UPDATE bordereaux b SET ${sets.join(', ')} WHERE b.id = ?`, params);
  return findById(id);
}

/**
 * Ajoute des dossiers à un bordereau (BROUILLON uniquement)
 */
export async function addDossiers(bordereauId, dossiers) {
  const [b] = await db.query(`SELECT id, statut FROM bordereaux WHERE id = ?`, [bordereauId]);
  if (!b) throw new Error('Bordereau introuvable');
  if (b.statut !== 'BROUILLON') throw new Error('Impossible d\'ajouter des dossiers : bordereau déjà émis');

  const values = dossiers.map((d, idx) => [bordereauId, d.id, d.ordre ?? idx]);
  await db.query(
    `INSERT IGNORE INTO bordereaux_dossiers (bordereau_id, dossier_id, ordre) VALUES ?`,
    [values]
  );
  return findById(bordereauId);
}

/**
 * Retire un dossier d'un bordereau (BROUILLON uniquement)
 */
export async function removeDossier(bordereauId, dossierId) {
  const [b] = await db.query(`SELECT id, statut FROM bordereaux WHERE id = ?`, [bordereauId]);
  if (!b) throw new Error('Bordereau introuvable');
  if (b.statut !== 'BROUILLON') throw new Error('Impossible de retirer un dossier : bordereau déjà émis');

  await db.query(
    `DELETE FROM bordereaux_dossiers WHERE bordereau_id = ? AND dossier_id = ?`,
    [bordereauId, dossierId]
  );
  return findById(bordereauId);
}

/**
 * Émet le bordereau : passe de BROUILLON → EMIS, date_transmission = NOW
 * Notifie la division destinataire
 */
export async function emit(bordereauId, agentId) {
  const [b] = await db.query(`SELECT id, statut FROM bordereaux WHERE id = ?`, [bordereauId]);
  if (!b) throw new Error('Bordereau introuvable');
  if (b.statut !== 'BROUILLON') throw new Error('Seul un bordereau en brouillon peut être émis');

  await db.query(
    `UPDATE bordereaux SET statut = 'EMIS', date_transmission = NOW(), agent_id = COALESCE(agent_id, ?) WHERE id = ?`,
    [agentId || null, bordereauId]
  );

  // TODO: notification à la division (via notificationService)
  return findById(bordereauId);
}

/**
 * Accusé de réception par la division : EMIS → RECU_PAR_DIVISION
 */
export async function acknowledge(bordereauId, agentId) {
  const [b] = await db.query(`SELECT id, statut FROM bordereaux WHERE id = ?`, [bordereauId]);
  if (!b) throw new Error('Bordereau introuvable');
  if (b.statut !== 'EMIS') throw new Error('Seul un bordereau émis peut être accusé réception');

  await db.query(
    `UPDATE bordereaux SET statut = 'RECU_PAR_DIVISION', date_reception_division = NOW(), recu_par = ? WHERE id = ?`,
    [agentId, bordereauId]
  );

  // Mettre à jour le statut des dossiers (si ORIGINAL, les passer en AFFECTE ?)
  // Pour l'instant on ne touche pas aux dossiers ici
  return findById(bordereauId);
}

/**
 * Archive un bordereau
 */
export async function archive(bordereauId) {
  await db.query(
    `UPDATE bordereaux SET statut = 'ARCHIVE' WHERE id = ? AND statut = 'RECU_PAR_DIVISION'`,
    [bordereauId]
  );
  return findById(bordereauId);
}

/**
 * Supprime un bordereau (BROUILLON uniquement)
 */
export async function remove(id) {
  const [b] = await db.query(`SELECT id, statut FROM bordereaux WHERE id = ?`, [id]);
  if (!b) throw new Error('Bordereau introuvable');
  if (b.statut !== 'BROUILLON') throw new Error('Seul un bordereau en brouillon peut être supprimé');

  await db.query(`DELETE FROM bordereaux WHERE id = ?`, [id]);
  return { message: 'Bordereau supprimé' };
}

/**
 * Liste des dossiers éligibles pour un bordereau (statuts ORIENTE/EMIS non encore dans un bordereau)
 */
export async function dossiersEligibles(division_id) {
  return db.query(
    `SELECT d.id, d.numero, d.objet, d.statut_id, s.code AS statut_code, s.libelle AS statut_libelle,
            d.demandeur, d.division_id
     FROM dossiers d
     JOIN statuts_dossiers s ON s.id = d.statut_id
     LEFT JOIN bordereaux_dossiers bd ON bd.dossier_id = d.id
     LEFT JOIN bordereaux b ON b.id = bd.bordereau_id
     WHERE d.division_id = ?
       AND s.code IN ('ORIENTE', 'EMIS')
       AND (bd.bordereau_id IS NULL OR b.statut = 'BROUILLON')
     ORDER BY d.numero`,
    [division_id]
  );
}

/**
 * Stats pour dashboard secrétaire
 */
export async function getStats() {
  const [total] = await db.query(`SELECT COUNT(*) AS total FROM bordereaux`);
  const [parStatut] = await db.query(
    `SELECT statut, COUNT(*) AS total FROM bordereaux GROUP BY statut`
  );
  const [aConfirmer] = await db.query(
    `SELECT COUNT(*) AS total FROM bordereaux WHERE statut = 'EMIS'`
  );
  return { total: total.total, parStatut, aConfirmer: aConfirmer.total };
}
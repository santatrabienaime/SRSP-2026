import db from '../config/db.js';

/**
 * Signalements de dossiers bloqués.
 *
 * Une fiche par difficulté constatée : qui l'a ouverte, sur quel dossier,
 * pour quel motif, et comment elle a été refermée. La liste est triée par
 * urgence puis par ancienneté — un signalement critique ouvert depuis trois
 * jours ne doit pas attendre derrière un signalement normal du matin.
 */

const PROJECTION = `
  SELECT s.*,
         d.numero AS dossier_numero, d.objet AS dossier_objet,
         t.code AS type_code, t.libelle AS type_libelle,
         dv.nom AS division_nom, dv.code AS division_code,
         agAuteur.nom AS auteur_nom, agAuteur.prenom AS auteur_prenom,
         auteur.username AS auteur_username,
         traiteur.username AS traiteur_username,
         agTraiteur.nom AS traiteur_nom, agTraiteur.prenom AS traiteur_prenom
  FROM signalements_dossier s
  JOIN dossiers d ON d.id = s.dossier_id
  JOIN types_dossiers t ON t.id = d.type_id
  LEFT JOIN divisions dv ON dv.id = s.division_id
  JOIN users auteur ON auteur.id = s.signale_par
  LEFT JOIN agents agAuteur ON agAuteur.id = (
    SELECT a2.id FROM agents a2 WHERE a2.user_id = s.signale_par ORDER BY a2.id LIMIT 1
  )
  LEFT JOIN users traiteur ON traiteur.id = s.traite_par
  LEFT JOIN agents agTraiteur ON agTraiteur.id = (
    SELECT a3.id FROM agents a3 WHERE a3.user_id = s.traite_par ORDER BY a3.id LIMIT 1
  )
`;

const ORDRE = `
  ORDER BY array_position(ARRAY['OUVERT', 'EN_COURS', 'RESOLU', 'REJETE'], s.statut),
           array_position(ARRAY['CRITIQUE', 'HAUTE', 'NORMALE'], s.priorite),
           s.created_at DESC
`;

export async function create({
  dossier_id, division_id, signale_par, type, priorite, motif,
}) {
  const result = await db.query(
    `INSERT INTO signalements_dossier
       (dossier_id, division_id, signale_par, type, priorite, motif)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [dossier_id, division_id || null, signale_par, type, priorite, motif]
  );
  return result.insertId;
}

export async function findById(id) {
  const rows = await db.query(`${PROJECTION} WHERE s.id = ?`, [id]);
  return rows[0];
}

/** Signalements d'un dossier, du plus récent au plus ancien. */
export async function findByDossier(dossierId) {
  return db.query(
    `${PROJECTION} WHERE s.dossier_id = ?
     ORDER BY s.created_at DESC`,
    [dossierId]
  );
}

/**
 * Liste filtrée.
 *
 * `divisionId` est imposé par le service pour un chef de division : il ne
 * voit que les signalements de sa division, même s'il devine un identifiant.
 */
export async function findAll({
  statut, type, priorite, divisionId, dossierId, limit = 200,
} = {}) {
  const conditions = [];
  const params = [];
  if (statut) { conditions.push('s.statut = ?'); params.push(statut); }
  if (type) { conditions.push('s.type = ?'); params.push(type); }
  if (priorite) { conditions.push('s.priorite = ?'); params.push(priorite); }
  if (divisionId) { conditions.push('s.division_id = ?'); params.push(divisionId); }
  if (dossierId) { conditions.push('s.dossier_id = ?'); params.push(dossierId); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(Number(limit) || 200);
  return db.query(`${PROJECTION} ${where} ${ORDRE} LIMIT ?`, params);
}

/** Un signalement encore ouvert du même auteur sur le même dossier. */
export async function findOuvertDUneMemePersonne(dossierId, userId) {
  const [ligne] = await db.query(
    `SELECT id, statut FROM signalements_dossier
     WHERE dossier_id = ? AND signale_par = ? AND statut IN ('OUVERT', 'EN_COURS')
     LIMIT 1`,
    [dossierId, userId]
  );
  return ligne;
}

export async function prendreEnCharge(id, userId) {
  await db.query(
    `UPDATE signalements_dossier
     SET statut = 'EN_COURS', traite_par = ?, date_prise_en_charge = NOW()
     WHERE id = ? AND statut = 'OUVERT'`,
    [userId, id]
  );
}

export async function resoudre(id, { userId, statut, resolution }) {
  await db.query(
    `UPDATE signalements_dossier
     SET statut = ?, traite_par = COALESCE(traite_par, ?),
         resolution = ?, date_resolution = NOW(),
         date_prise_en_charge = COALESCE(date_prise_en_charge, NOW())
     WHERE id = ? AND statut IN ('OUVERT', 'EN_COURS')`,
    [statut, userId, resolution, id]
  );
}

/** Nombre de signalements non refermés, pour les compteurs d'écran. */
export async function compterOuverts(divisionId = null) {
  const params = [];
  let where = "WHERE statut IN ('OUVERT', 'EN_COURS')";
  if (divisionId) { where += ' AND division_id = ?'; params.push(divisionId); }
  const [ligne] = await db.query(
    `SELECT COUNT(*) AS n FROM signalements_dossier ${where}`,
    params
  );
  return Number(ligne?.n || 0);
}

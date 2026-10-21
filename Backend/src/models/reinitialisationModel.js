import db from '../config/db.js';

/**
 * Demandes de réinitialisation de mot de passe.
 *
 * Le circuit : l'agent fait sa demande, un administrateur vérifie son identité
 * et lui remet un code à usage unique, l'agent choisit son nouveau mot de
 * passe. Aucun e-mail, aucun SMS — ce sont des canaux explicitement exclus
 * du périmètre, et l'administration du service est un canal fiable.
 *
 * Le code n'est jamais stocké en clair : seule son empreinte l'est. Il est
 * valable peu de temps, ne sert qu'une fois, et le nombre de tentatives est
 * plafonné.
 */

/** Demande en attente pour un compte donné (la plus récente). */
export async function findDemandeEnAttente(userId) {
  const rows = await db.query(
    `SELECT * FROM reinitialisations_mot_de_passe
     WHERE user_id = ? AND statut IN ('EN_ATTENTE', 'CODE_GENERE')
     ORDER BY id DESC LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

/** Demande par identifiant de demande. */
export async function findDemande(id) {
  const rows = await db.query(
    'SELECT * FROM reinitialisations_mot_de_passe WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

/** Demande par identifiant, avec l'identité du compte concerné. */
export async function findDemandeAvecCompte(id) {
  const rows = await db.query(
    `SELECT r.*,
            u.username, u.email, u.actif,
            a.nom AS agent_nom, a.prenom AS agent_prenom,
            dv.nom AS division_nom,
            ad.username AS code_genere_par_username
     FROM reinitialisations_mot_de_passe r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN agents a ON a.user_id = u.id
     LEFT JOIN divisions dv ON dv.id = a.division_id
     LEFT JOIN users ad ON ad.id = r.code_genere_par
     WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
}

/** Demande utilisable pour un compte : statut `CODE_GENERE`, code valide. */
export async function findDemandeActive(userId) {
  const rows = await db.query(
    `SELECT * FROM reinitialisations_mot_de_passe
     WHERE user_id = ? AND statut = 'CODE_GENERE' AND expire_le > NOW()
     ORDER BY id DESC LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

/** Enregistre une nouvelle demande. */
export async function createDemande({ userId, identifiantSaisi, ipAddress }) {
  const result = await db.query(
    `INSERT INTO reinitialisations_mot_de_passe
       (user_id, identifiant_saisi, statut, ip_address)
     VALUES (?, ?, 'EN_ATTENTE', ?)`,
    [userId, identifiantSaisi || null, ipAddress || null]
  );
  return { id: result.insertId };
}

/**
 * Associe un code à la demande et la passe en `CODE_GENERE`.
 *
 * L'empreinte remplace l'ancienne : un code précédent devient inutilisable
 * dès qu'un nouveau est délivré.
 */
export async function attacherCode(id, { empreinte, adminId, expireLe, motif }) {
  await db.query(
    `UPDATE reinitialisations_mot_de_passe
     SET statut = 'CODE_GENERE', empreinte = ?, code_genere_par = ?, code_genere_le = NOW(),
         expire_le = ?, motif = ?, tentatives = 0
     WHERE id = ?`,
    [empreinte, adminId || null, expireLe, motif || null, id]
  );
  return findDemande(id);
}

/** Compte une tentative de code erroné, et annule la demande au plafond. */
export async function enregistrerTentative(id, maxTentatives) {
  await db.query(
    'UPDATE reinitialisations_mot_de_passe SET tentatives = tentatives + 1 WHERE id = ?',
    [id]
  );
  const [courant] = await db.query(
    'SELECT tentatives FROM reinitialisations_mot_de_passe WHERE id = ?',
    [id]
  );
  const tentatives = Number(courant?.tentatives || 0);
  if (tentatives >= maxTentatives) {
    await db.query(
      `UPDATE reinitialisations_mot_de_passe
       SET statut = 'ANNULE', empreinte = NULL
       WHERE id = ?`,
      [id]
    );
  }
  return { tentatives, annulee: tentatives >= maxTentatives };
}

/** Marque la demande comme utilisée. */
export async function marquerUtilise(id) {
  await db.query(
    `UPDATE reinitialisations_mot_de_passe
     SET statut = 'UTILISE', utilise_le = NOW(), empreinte = NULL
     WHERE id = ?`,
    [id]
  );
  return findDemande(id);
}

/** Annule une demande (refus de l'administrateur). */
export async function annuler(id, motif) {
  await db.query(
    `UPDATE reinitialisations_mot_de_passe
     SET statut = 'ANNULE', empreinte = NULL, motif = COALESCE(?, motif)
     WHERE id = ?`,
    [motif || null, id]
  );
  return findDemande(id);
}

/**
 * Liste des demandes, les plus récentes d'abord.
 *
 * Chaque ligne porte l'identité du compte concerné : l'administrateur doit
 * pouvoir savoir à qui il parle avant de délivrer un code.
 */
export async function listDemandes({ statut, limite = 100 } = {}) {
  const where = [];
  const params = [];
  if (statut) {
    where.push('r.statut = ?');
    params.push(statut);
  }
  const rows = await db.query(
    `SELECT r.*,
            u.username, u.email, u.actif,
            a.nom AS agent_nom, a.prenom AS agent_prenom,
            dv.nom AS division_nom,
            ad.username AS code_genere_par_username
     FROM reinitialisations_mot_de_passe r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN agents a ON a.user_id = u.id
     LEFT JOIN divisions dv ON dv.id = a.division_id
     LEFT JOIN users ad ON ad.id = r.code_genere_par
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY r.created_at DESC
     LIMIT ?`,
    [...params, Number(limite) || 100]
  );
  return rows;
}

/** Demandes en attente, pour le compteur de l'écran d'administration. */
export async function compterEnAttente() {
  const rows = await db.query(
    `SELECT COUNT(*) AS n FROM reinitialisations_mot_de_passe
     WHERE statut IN ('EN_ATTENTE', 'CODE_GENERE')`
  );
  return Number(rows[0]?.n || 0);
}

import db from '../config/db.js';

/**
 * Commentaires internes sur un dossier (article 2.8).
 * Texte libre déposé par un agent — aucune mécanique annexe (pas de
 * mention, pas de notification dédiée).
 */

export async function create({ dossier_id, auteur_id, contenu }) {
  const res = await db.query(
    `INSERT INTO dossier_commentaires (dossier_id, auteur_id, contenu)
     VALUES (?, ?, ?)`,
    [dossier_id, auteur_id, contenu]
  );
  return findOne(res.insertId);
}

export async function findOne(id) {
  const rows = await db.query(
    `SELECT c.*, u.username, u.email,
            d.numero AS dossier_numero
     FROM dossier_commentaires c
     JOIN users u ON u.id = c.auteur_id
     LEFT JOIN dossiers d ON d.id = c.dossier_id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function findByDossier(dossier_id) {
  const rows = await db.query(
    `SELECT c.id FROM dossier_commentaires c
     WHERE c.dossier_id = ?
     ORDER BY c.date_creation DESC, c.id DESC`,
    [dossier_id]
  );
  return Promise.all(rows.map((r) => findOne(r.id)));
}

export async function remove(id, auteurId) {
  const res = await db.query(
    'DELETE FROM dossier_commentaires WHERE id = ? AND auteur_id = ?',
    [id, auteurId]
  );
  return res.affectedRows > 0;
}

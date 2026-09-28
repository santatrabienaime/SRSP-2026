import db from '../config/db.js';

/**
 * Commentaires internes sur un dossier (article 2.8).
 *
 * Un commentaire peut mentionner des collègues via la syntaxe @identifiant.
 * Les mentions sont résolues vers des utilisateurs réels : une mention
 * inconnue est simplement ignorée, elle ne crée pas de notification fantôme.
 */

/** Identifiants trouvés dans un texte, syntaxe « @identifiant ». */
export function extraireMentions(contenu) {
  const trouves = new Set();
  for (const m of String(contenu || '').matchAll(/@([A-Za-z0-9._-]{2,50})/g)) {
    trouves.add(m[1]);
  }
  return [...trouves];
}

/** Résout des identifiants en utilisateurs actifs. */
async function resoudreUtilisateurs(identifiants) {
  if (!identifiants.length) return [];
  const rows = await db.query(
    `SELECT id FROM users
     WHERE actif = TRUE AND username IN (${identifiants.map(() => '?').join(',')})`,
    identifiants
  );
  return rows.map((r) => r.id);
}

export async function create({ dossier_id, auteur_id, contenu }) {
  const res = await db.query(
    `INSERT INTO dossier_commentaires (dossier_id, auteur_id, contenu)
     VALUES (?, ?, ?)`,
    [dossier_id, auteur_id, contenu]
  );
  const commentaireId = res.insertId;

  const identifiants = extraireMentions(contenu);
  const users = await resoudreUtilisateurs(identifiants);
  for (const userId of users) {
    // INSERT IGNORE : un commentaire ne mentionne qu'une fois la même personne
    await db.query(
      'INSERT IGNORE INTO commentaire_mentions (commentaire_id, user_id) VALUES (?, ?)',
      [commentaireId, userId]
    );
  }

  return findOne(commentaireId);
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
  if (!rows[0]) return null;
  const mentions = await db.query(
    `SELECT u.username FROM commentaire_mentions cm
     JOIN users u ON u.id = cm.user_id
     WHERE cm.commentaire_id = ? ORDER BY u.username`,
    [id]
  );
  return { ...rows[0], mentions: mentions.map((m) => m.username) };
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

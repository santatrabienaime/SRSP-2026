import db from '../config/db.js';

/**
 * Pièces jointes d'un dossier.
 *
 * Le fichier lui-même est sur disque sous un nom UUID ; la base ne conserve que
 * le nom d'origine (pour l'affichage), le chemin opaque et les métadonnées. Un
 * document n'est jamais écrasé : un nouveau dépôt crée une nouvelle ligne.
 */

export async function findByDossier(dossierId) {
  return db.query(
    `SELECT doc.*, td.libelle AS type_libelle,
            u.username AS upload_par_username,
            ag.nom AS upload_par_nom, ag.prenom AS upload_par_prenom,
            tp.libelle AS piece_libelle,
            prec.nom_fichier AS remplace_nom_fichier,
            prec.version AS remplace_version
     FROM documents doc
     LEFT JOIN types_documents td ON td.id = doc.type_id
     LEFT JOIN users u ON u.id = doc.upload_par
     LEFT JOIN agents ag ON ag.user_id = u.id
     LEFT JOIN types_pieces tp ON tp.code = doc.piece_code
     LEFT JOIN documents prec ON prec.id = doc.remplace
     WHERE doc.dossier_id = ?
     ORDER BY doc.piece_code, doc.version DESC, doc.id DESC`,
    [dossierId]
  );
}

/**
 * Dernière version déposée pour une pièce d'un dossier.
 *
 * C'est elle que le dépôt suivant remplace : la version précédente n'est
 * jamais effacée, elle devient la version antérieure.
 */
export async function derniereVersion(dossierId, pieceCode) {
  const rows = await db.query(
    `SELECT id, version, nom_fichier FROM documents
     WHERE dossier_id = ? AND piece_code = ?
     ORDER BY version DESC, id DESC
     LIMIT 1`,
    [dossierId, pieceCode]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const rows = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function create({
  dossier_id, type_id, piece_code, nom_fichier, chemin_stockage,
  taille, description, upload_par, version, remplace, motif_remplacement,
}) {
  const result = await db.query(
    `INSERT INTO documents
       (dossier_id, type_id, piece_code, version, remplace, motif_remplacement,
        nom_fichier, chemin_stockage, taille, description, valide, upload_par)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      dossier_id,
      type_id || null,
      piece_code || null,
      version || 1,
      remplace || null,
      motif_remplacement || null,
      nom_fichier,
      chemin_stockage,
      taille || null,
      description || null,
      upload_par || null,
    ]
  );
  return { id: result.insertId };
}

export async function remove(id) {
  await db.query('DELETE FROM documents WHERE id = ?', [id]);
}

/** Vérifie qu'une pièce est bien requise pour ce dossier (type et sous-type). */
export async function pieceApplicable(dossierId, pieceCode) {
  const rows = await db.query(
    `SELECT tp.id
     FROM dossiers dos
     JOIN types_pieces tp
       ON tp.code = ?
      AND tp.actif = 1
      AND (tp.type_dossier_id IS NULL OR tp.type_dossier_id = dos.type_id)
      AND (tp.sous_type_id IS NULL OR tp.sous_type_id = dos.sous_type_id)
     WHERE dos.id = ?
     LIMIT 1`,
    [pieceCode, dossierId]
  );
  return rows.length > 0;
}

export async function typeDocumentExiste(typeId) {
  const rows = await db.query('SELECT id FROM types_documents WHERE id = ?', [typeId]);
  return rows.length > 0;
}

/** Un document du dossier, contrôlé par l'identifiant du dossier. */
export async function findPourDossier(documentId, dossierId) {
  const rows = await db.query(
    'SELECT * FROM documents WHERE id = ? AND dossier_id = ?',
    [documentId, dossierId]
  );
  return rows[0] || null;
}

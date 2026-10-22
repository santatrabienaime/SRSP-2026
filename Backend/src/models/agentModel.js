import db from '../config/db.js';
import { normaliserMatricule } from '../validators/dossierValidators.js';

/**
 * Liste des fiches du personnel, avec le compte de connexion rattaché.
 *
 * La fiche (`agents`) et le compte (`users`) décrivent la même personne : ils
 * sont donc lus ensemble, sinon l'écran « Personnel » devrait recouper deux
 * listes pour savoir qui peut se connecter.
 *
 * `a.email` est l'email de contact de la fiche, `compte_email` celui de la
 * connexion : ce sont deux informations différentes, nommées différemment pour
 * qu'aucune ne soit prise pour l'autre.
 */
export async function findAll(filters = {}) {
  let query = `
    SELECT a.*, f.libelle AS fonction_libelle, d.nom AS division_nom, d.code AS division_code,
           u.id AS compte_id, u.username, u.email AS compte_email, u.role_id,
           r.nom AS role_nom, u.actif AS compte_actif, u.derniere_connexion,
           /* Un agent « de traitement » est celui dont le rôle porte
              « traiter_dossier ». C'est la même règle que l'affectation
              automatique : elle est lue en base, pas écrite dans l'écran, pour
              qu'un rôle ajouté plus tard soit pris en compte sans développement. */
           EXISTS(
             SELECT 1 FROM role_permissions rp
             JOIN permissions p ON p.id = rp.permission_id
             WHERE rp.role_id = u.role_id AND p.nom = 'traiter_dossier'
           ) AS peut_traiter
    FROM agents a
    LEFT JOIN fonctions f ON a.fonction_id = f.id
    LEFT JOIN divisions d ON a.division_id = d.id
    LEFT JOIN users u ON u.id = a.user_id
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE 1=1
  `;
  const params = [];
  if (filters.division_id) {
    query += ' AND a.division_id = ?';
    params.push(filters.division_id);
  }
  query += ' ORDER BY a.nom, a.prenom';
  return db.query(query, params);
}

export async function findById(id) {
  const rows = await db.query('SELECT * FROM agents WHERE id = ?', [id]);
  return rows[0];
}

/** Fiche complète (compte inclus) d'une personne : écran de détail. */
export async function findAvecCompte(id) {
  const rows = await db.query(
    `SELECT a.*, f.libelle AS fonction_libelle, d.nom AS division_nom, d.code AS division_code,
            u.id AS compte_id, u.username, u.email AS compte_email, u.role_id,
            r.nom AS role_nom, u.actif AS compte_actif, u.derniere_connexion
     FROM agents a
     LEFT JOIN fonctions f ON a.fonction_id = f.id
     LEFT JOIN divisions d ON d.id = a.division_id
     LEFT JOIN users u ON u.id = a.user_id
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE a.id = ?`,
    [id]
  );
  return rows[0];
}

/** La fiche rattachée à un compte, s'il en a une. */
export async function findByUserId(userId) {
  const rows = await db.query('SELECT * FROM agents WHERE user_id = ? ORDER BY id', [userId]);
  return rows;
}

/**
 * Un matricule est-il déjà attribué à une autre fiche ?
 *
 * La base porte une contrainte d'unicité, mais son message est illisible : cette
 * lecture permet de nommer la personne qui le détient déjà.
 *
 * La comparaison se fait sur la forme compacte — « SRSP-005 » et « SRSP005 »
 * désignent le même matricule — car la contrainte SQL, elle, distingue les deux
 * écritures. Un service peut écrire son numéro avec ou sans séparateur : c'est
 * la même personne.
 */
export async function matriculePris(matricule, saufId = null) {
  const compact = normaliserMatricule(matricule);
  if (!compact) return null;
  const rows = await db.query(
    'SELECT id, nom, prenom, matricule FROM agents WHERE matricule IS NOT NULL AND (? IS NULL OR id <> ?)',
    [saufId, saufId]
  );
  return rows.find((r) => normaliserMatricule(r.matricule) === compact) || null;
}

export async function create(data) {
  const { user_id, nom, prenom, matricule, fonction_id, division_id, email, telephone, actif } = data;
  const result = await db.query(
    `INSERT INTO agents (user_id, nom, prenom, matricule, fonction_id, division_id, email, telephone, actif)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id || null, nom, prenom, matricule || null, fonction_id || null,
      division_id || null, email || null, telephone || null, actif === undefined ? 1 : (actif ? 1 : 0),
    ]
  );
  return { id: result.insertId };
}

/**
 * Colonnes qu'une modification de fiche peut toucher. La liste est fermée :
 * `user_id` n'y figure pas — un compte se lie ou se délie par les fonctions
 * dédiées, sinon un formulaire pourrait rattacher une fiche à n'importe quel
 * compte au passage.
 */
const COLONNES_MODIFIABLES = [
  'nom', 'prenom', 'matricule', 'fonction_id', 'division_id', 'email', 'telephone', 'actif',
];

/**
 * Modification partielle : seuls les champs présents dans `data` sont écrits.
 *
 * Une requête à trous écrirait `undefined` partout et effacerait en silence les
 * colonnes absentes du formulaire ; c'est exactement ce qui arrivait au
 * formulaire de fiche, qui n'envoyait pas toujours tous les champs.
 */
export async function update(id, data) {
  const champs = COLONNES_MODIFIABLES.filter((c) => data[c] !== undefined);
  if (champs.length === 0) return;
  const affectations = champs.map((c) => `${c} = ?`).join(', ');
  await db.query(
    `UPDATE agents SET ${affectations} WHERE id = ?`,
    [...champs.map((c) => data[c]), id]
  );
}

export async function remove(id) {
  await db.query('DELETE FROM agents WHERE id = ?', [id]);
}

export async function setActif(id, actif) {
  await db.query('UPDATE agents SET actif = ? WHERE id = ?', [actif ? 1 : 0, id]);
}

/** Rattache (ou détache, avec `null`) une fiche à un compte de connexion. */
export async function setUserId(id, userId) {
  await db.query('UPDATE agents SET user_id = ? WHERE id = ?', [userId || null, id]);
}

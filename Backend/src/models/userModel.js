import db from '../config/db.js';

export async function findUserById(id) {
  const rows = await db.query(
    `SELECT u.id, u.username, u.email, u.role_id, r.nom AS role_nom, u.actif
     FROM users u LEFT JOIN roles r ON u.role_id = r.id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0];
}

export async function findUserByUsernameOrEmail(identifiant) {
  const rows = await db.query(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [identifiant, identifiant]
  );
  return rows[0];
}

export async function findById(id) {
  const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}

export async function getAllUsers() {
  return db.query(
    `SELECT u.id, u.username, u.email, u.role_id, r.nom AS role_nom, u.actif, u.derniere_connexion
     FROM users u LEFT JOIN roles r ON u.role_id = r.id
     ORDER BY u.username`
  );
}

export async function createUser({ username, email, password_hash, role_id }) {
  const result = await db.query(
    'INSERT INTO users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
    [username, email, password_hash, role_id]
  );
  return { id: result.insertId, username, email, role_id };
}

export async function updateUser(id, { email, role_id, actif }) {
  await db.query(
    'UPDATE users SET email = ?, role_id = ?, actif = ? WHERE id = ?',
    [email, role_id, actif, id]
  );
  return findUserById(id);
}

export async function updatePassword(id, password_hash) {
  await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
}

export async function toggleUser(id) {
  await db.query('UPDATE users SET actif = NOT actif WHERE id = ?', [id]);
  return findUserById(id);
}

export async function setActif(id, actif) {
  await db.query('UPDATE users SET actif = ? WHERE id = ?', [actif ? 1 : 0, id]);
}

export async function deleteUser(id) {
  await db.query('DELETE FROM users WHERE id = ?', [id]);
}

export async function updateLastConnection(id) {
  await db.query('UPDATE users SET derniere_connexion = NOW() WHERE id = ?', [id]);
}

/* ------------------------------------------------------------------ */
/* Verrouillage de compte après échecs de connexion                    */
/* ------------------------------------------------------------------ */

/** Incrémente le compteur d'échecs et verrouille si le seuil est atteint. */
export async function registerFailedAttempt(id, maxAttempts, lockMinutes) {
  await db.query(
    `UPDATE users
     SET tentatives_echouees = tentatives_echouees + 1,
         verrouille_jusqua = CASE
           WHEN tentatives_echouees >= ? THEN DATE_ADD(NOW(), INTERVAL ? MINUTE)
           ELSE verrouille_jusqua
         END
     WHERE id = ?`,
    [maxAttempts, lockMinutes, id]
  );
  const rows = await db.query(
    'SELECT tentatives_echouees, verrouille_jusqua FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

/** Remet le compteur à zéro après une connexion réussie. */
export async function resetFailedAttempts(id) {
  await db.query(
    'UPDATE users SET tentatives_echouees = 0, verrouille_jusqua = NULL WHERE id = ?',
    [id]
  );
}

/** Remet le compteur à zéro lorsqu'un administrateur réinitialise un mot de passe. */
export async function unlockUser(id) {
  await db.query(
    'UPDATE users SET tentatives_echouees = 0, verrouille_jusqua = NULL WHERE id = ?',
    [id]
  );
}
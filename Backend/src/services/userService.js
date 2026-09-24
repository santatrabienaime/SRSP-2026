import bcrypt from 'bcryptjs';
import * as userModel from '../models/userModel.js';

export async function getAll() {
  return userModel.getAllUsers();
}

export async function create({ username, email, password, role_id }) {
  const password_hash = await bcrypt.hash(password, 10);
  return userModel.createUser({ username, email, password_hash, role_id });
}

export async function update(id, data) {
  return userModel.updateUser(id, data);
}

/** Active / désactive un compte (PATCH /api/users/:id/toggle). */
export async function toggle(id) {
  return userModel.toggleUser(id);
}

/**
 * Supprime un compte ; si des références existent (contrainte FK), le compte
 * est désactivé à la place (apurement via l'historique d'audit).
 */
export async function remove(id) {
  try {
    await userModel.deleteUser(id);
    return { message: 'Utilisateur supprimé.' };
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2' || e.errno === 1451) {
      await userModel.setActif(id, false);
      return { message: 'Utilisateur référencé : compte désactivé plutôt que supprimé.' };
    }
    throw e;
  }
}

export async function resetPassword(id, newPassword) {
  const password_hash = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(id, password_hash);
  // Une réinitialisation par un administrateur déverrouille le compte.
  await userModel.unlockUser(id);
}
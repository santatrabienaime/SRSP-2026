import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';
import { httpError } from '../utils/httpError.js';

export async function authenticateUser(identifiant, password) {
  const user = await userModel.findUserByUsernameOrEmail(identifiant);
  if (!user) throw httpError(401, 'Identifiants incorrects.');
  if (!user.actif) throw httpError(403, 'Compte désactivé. Contactez l’administrateur.');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw httpError(401, 'Identifiants incorrects.');

  const token = jwt.sign(
    { id: user.id, role_id: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  await userModel.updateLastConnection(user.id);

  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

export async function getUserById(userId) {
  return userModel.findUserById(userId);
}

export async function changePassword(userId, oldPassword, newPassword) {
  const user = await userModel.findById(userId);
  if (!user) throw httpError(404, 'Utilisateur introuvable.');
  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) throw httpError(400, 'Mot de passe actuel incorrect.');
  const password_hash = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(userId, password_hash);
  return { message: 'Mot de passe modifié.' };
}
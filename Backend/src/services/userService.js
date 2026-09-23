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

export async function resetPassword(id, newPassword) {
  const password_hash = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(id, password_hash);
}
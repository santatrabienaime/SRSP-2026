import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';
import { httpError } from '../utils/httpError.js';

/** Nombre d'échecs tolérés avant verrouillage temporaire du compte. */
const MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS || 5);
/** Durée du verrouillage, en minutes. */
const LOCK_MINUTES = Number(process.env.LOGIN_LOCK_MINUTES || 15);

export async function authenticateUser(identifiant, password) {
  const user = await userModel.findUserByUsernameOrEmail(identifiant);
  if (!user) throw httpError(401, 'Identifiants incorrects.');
  if (!user.actif) throw httpError(403, 'Compte désactivé. Contactez l’administrateur.');

  // Compte temporairement verrouillé après trop d'échecs
  if (user.verrouille_jusqua && new Date(user.verrouille_jusqua) > new Date()) {
    const minutes = Math.max(
      1,
      Math.ceil((new Date(user.verrouille_jusqua) - new Date()) / 60000)
    );
    throw httpError(
      423,
      `Compte temporairement verrouillé après ${MAX_ATTEMPTS} tentatives échouées. Réessayez dans ${minutes} minute(s).`
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const state = await userModel.registerFailedAttempt(
      user.id, MAX_ATTEMPTS, LOCK_MINUTES
    );
    const restant = state ? Math.max(0, MAX_ATTEMPTS - state.tentatives_echouees) : 0;
    if (state?.verrouille_jusqua && new Date(state.verrouille_jusqua) > new Date()) {
      throw httpError(
        423,
        `Compte verrouillé après ${MAX_ATTEMPTS} tentatives échouées. Réessayez dans ${LOCK_MINUTES} minutes.`
      );
    }
    throw httpError(401, `Identifiants incorrects. ${restant} tentative(s) restante(s).`);
  }

  const token = jwt.sign(
    {
      id: user.id,
      role_id: user.role_id,
      /* Instant d'émission au millième. `iat`, posé par la bibliothèque, est
         en secondes : or la révocation d'une session compare cet instant à
         la date du dernier changement de mot de passe, qui est elle aussi
         datée au millième. Sans cette précision, un jeton émis dans la même
         seconde qu'un changement de mot de passe serait ambigu — et un agent
         réinitialisé à l'instant se verrait refuser sa propre connexion. */
      iatMs: Date.now(),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  await userModel.updateLastConnection(user.id);
  // Connexion réussie : on repart de zéro
  await userModel.resetFailedAttempts(user.id);

  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

export async function getUserById(userId) {
  return userModel.findUserById(userId);
}

/** Résout l'identifiant d'un utilisateur (username ou email), sans exposer le hash. */
export async function findUserIdByIdentifiant(identifiant) {
  if (!identifiant) return null;
  const user = await userModel.findUserByUsernameOrEmail(identifiant);
  return user ? { id: user.id, email: user.email } : null;
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
import * as authService from '../services/authService.js';
import * as historiqueModel from '../models/historiqueModel.js';

/** Durée de validité d'un mot de passe avant renouvellement (article 1.5). */
export const PASSWORD_MAX_AGE_DAYS = Number(process.env.PASSWORD_MAX_AGE_DAYS || 90);

/**
 * Indique si le mot de passe a dépassé sa durée de validité, et depuis combien
 * de jours. Un compte cree sans historique est considere valide.
 */
export function passwordExpiry(mot_de_passe_change_le) {
  if (!mot_de_passe_change_le) {
    return { a_changer: false, jours_restants: PASSWORD_MAX_AGE_DAYS };
  }
  const depuis = new Date(mot_de_passe_change_le);
  const limite = new Date(depuis.getTime() + PASSWORD_MAX_AGE_DAYS * 86400000);
  const reste = Math.ceil((limite - Date.now()) / 86400000);
  return { a_changer: reste <= 0, jours_restants: reste };
}

/** Adresse IP du client (gère le reverse-proxy via x-forwarded-for). */
function clientIp(req) {
  const fwd = req.headers?.['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || null;
}

export async function login(req, res, next) {
  const ip = clientIp(req);
  try {
    const { identifiant, password } = req.body;
    const { user, token } = await authService.authenticateUser(identifiant, password);
    await historiqueModel.log({
      user_id: user.id,
      action: 'CONNEXION',
      details: `Connexion réussie (${user.email}).`,
      ip_address: ip,
    });
    res.json({ user, token });
  } catch (error) {
    // Journalisation des échecs (utilisateur inconnu ou mauvais mot de passe)
    try {
      const auth = await authService.findUserIdByIdentifiant(req.body?.identifiant);
      await historiqueModel.log({
        user_id: auth?.id || null,
        action: 'CONNEXION_ECHOUEE',
        details: `Échec de connexion (${error.message}).`,
        ip_address: ip,
      });
    } catch {
      /* la journalisation ne doit jamais masquer l'erreur d'authentification */
    }
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const { password_hash, mot_de_passe_change_le, ...profil } = user;
    res.json({ ...profil, mot_de_passe: passwordExpiry(mot_de_passe_change_le) });
  } catch (error) { next(error); }
}

export async function logout(req, res) {
  res.json({ message: 'Déconnexion réussie' });
}

export async function changePassword(req, res, next) {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    const result = await authService.changePassword(req.user.id, ancien_mot_de_passe, nouveau_mot_de_passe);
    res.json(result);
  } catch (error) { next(error); }
}

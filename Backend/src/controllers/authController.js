import * as authService from '../services/authService.js';

export async function login(req, res, next) {
  try {
    const { identifiant, password } = req.body;
    const { user, token } = await authService.authenticateUser(identifiant, password);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.json({ message: 'Déconnexion réussie' });
}

export async function changePassword(req, res, next) {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    const result = await authService.changePassword(req.user.id, ancien_mot_de_passe, nouveau_mot_de_passe);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
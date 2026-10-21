import * as reinitialisationService from '../services/reinitialisationService.js';

/**
 * Adresse IP du client (gère le reverse-proxy via x-forwarded-for).
 *
 * Dupliquée depuis le contrôleur d'authentification : les deux modules
 * journalisent des événements de sécurité, et une trace sans adresse IP
 * serait une trace incomplète.
 */
function clientIp(req) {
  const fwd = req.headers?.['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || null;
}

/**
 * Demande de réinitialisation (public).
 *
 * La réponse est identique quoi qu'il arrive : ni l'existence du compte, ni
 * son état ne sont révélés.
 */
export async function demander(req, res, next) {
  try {
    const resultat = await reinitialisationService.demander(req.body?.identifiant, clientIp(req));
    res.json({ message: resultat.message });
  } catch (error) { next(error); }
}

/**
 * Consommation du code et nouveau mot de passe (public).
 */
export async function reinitialiser(req, res, next) {
  try {
    const { identifiant, code, nouveau_mot_de_passe } = req.body || {};
    const resultat = await reinitialisationService.reinitialiser(
      identifiant,
      code,
      nouveau_mot_de_passe,
      clientIp(req)
    );
    res.json(resultat);
  } catch (error) { next(error); }
}

/** Demandes de réinitialisation (administrateur). */
export async function lister(req, res, next) {
  try {
    const demandes = await reinitialisationService.lister({
      statut: req.query.statut || undefined,
      limite: req.query.limite,
    });
    res.json(demandes);
  } catch (error) { next(error); }
}

/**
 * Délivrance du code (administrateur).
 *
 * Le code est renvoyé ici, et nulle part ailleurs : il n'est pas stocké, il
 * n'est donc pas reconsultable. L'administrateur le remet à l'agent.
 */
export async function genererCode(req, res, next) {
  try {
    const resultat = await reinitialisationService.genererCode(
      req.params.id,
      req.user.id,
      req.body?.motif
    );
    res.json(resultat);
  } catch (error) { next(error); }
}

/** Annulation d'une demande (administrateur). */
export async function annuler(req, res, next) {
  try {
    const demande = await reinitialisationService.annuler(
      req.params.id,
      req.user.id,
      req.body?.motif
    );
    res.json({ message: 'Demande annulée.', demande });
  } catch (error) { next(error); }
}

/** Détail d'une demande (administrateur). */
export async function detail(req, res, next) {
  try {
    res.json(await reinitialisationService.detail(req.params.id));
  } catch (error) { next(error); }
}

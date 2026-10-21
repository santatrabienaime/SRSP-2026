import * as performanceService from '../services/performanceService.js';
import * as scopeService from '../services/scopeService.js';

/**
 * Contrôleur des indicateurs de performance.
 *
 * Chaque point d'entrée applique le **périmètre** de l'utilisateur : sans
 * cela, un profil de division pourrait interroger la performance de toutes
 * les divisions et de tous les agents. Le cloisonnement doit tenir sur les
 * données, pas seulement sur ce que l'écran affiche.
 */

/** Les indicateurs globaux. */
export async function getStats(req, res, next) {
  try {
    const scope = await scopeService.getScope(req.user.id);
    res.json(await performanceService.getStats(scope));
  } catch (e) { next(e); }
}

/** Les dossiers dont la date limite est dépassée. */
export async function getEnRetard(req, res, next) {
  try {
    const scope = await scopeService.getScope(req.user.id);
    res.json(await performanceService.getEnRetard(scope));
  } catch (e) { next(e); }
}

/** La performance par division. */
export async function getParDivision(req, res, next) {
  try {
    const scope = await scopeService.getScope(req.user.id);
    res.json(await performanceService.getParDivision(scope));
  } catch (e) { next(e); }
}

/** La performance par agent. */
export async function getParAgent(req, res, next) {
  try {
    const scope = await scopeService.getScope(req.user.id);
    res.json(await performanceService.getParAgent(scope));
  } catch (e) { next(e); }
}

/** L'évolution du volume sur douze mois. */
export async function getEvolution(req, res, next) {
  try {
    const scope = await scopeService.getScope(req.user.id);
    res.json(await performanceService.getEvolution(scope));
  } catch (e) { next(e); }
}

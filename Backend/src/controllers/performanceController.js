import * as performanceService from '../services/performanceService.js';

/**
 * Contrôleur des statistiques de performance du service.
 * Fournit les indicateurs de performance basés sur les données réelles des dossiers.
 */

/**
 * Récupère les indicateurs de performance globaux.
 */
export async function getStats(req, res, next) {
  try {
    const stats = await performanceService.getStats();
    res.json(stats);
  } catch (e) {
    next(e);
  }
}

/**
 * Récupère les dossiers en retard.
 */
export async function getEnRetard(req, res, next) {
  try {
    const retards = await performanceService.getEnRetard();
    res.json(retards);
  } catch (e) {
    next(e);
  }
}

/**
 * Récupère les performances par division.
 */
export async function getParDivision(req, res, next) {
  try {
    const stats = await performanceService.getParDivision();
    res.json(stats);
  } catch (e) {
    next(e);
  }
}

/**
 * Récupère les performances par agent.
 */
export async function getParAgent(req, res, next) {
  try {
    const stats = await performanceService.getParAgent();
    res.json(stats);
  } catch (e) {
    next(e);
  }
}

/**
 * Récupère l'évolution des dossiers sur 12 mois.
 */
export async function getEvolution(req, res, next) {
  try {
    const evolution = await performanceService.getEvolution();
    res.json(evolution);
  } catch (e) {
    next(e);
  }
}

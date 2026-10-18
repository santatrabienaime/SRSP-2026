import express from 'express';
import * as ctrl from '../controllers/performanceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * Routes de performance - Statistiques de performance du service.
 * Toutes les routes requièrent une authentification.
 */

/**
 * GET /api/performance/stats - Statistiques globales de performance.
 */
router.get('/stats', ctrl.getStats);

/**
 * GET /api/performance/en-retard - Dossiers en retard.
 */
router.get('/en-retard', ctrl.getEnRetard);

/**
 * GET /api/performance/par-division - Performance par division.
 */
router.get('/par-division', ctrl.getParDivision);

/**
 * GET /api/performance/par-agent - Performance par agent.
 */
router.get('/par-agent', ctrl.getParAgent);

/**
 * GET /api/performance/evolution - Évolution des dossiers sur 12 mois.
 */
router.get('/evolution', ctrl.getEvolution);

export default router;

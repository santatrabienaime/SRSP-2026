import * as dashboardService from '../services/dashboardService.js';

export async function summary(req, res, next) {
  try { res.json(await dashboardService.getSummary()); } catch (e) { next(e); }
}

export async function byDivision(req, res, next) {
  try { res.json(await dashboardService.getByDivision()); } catch (e) { next(e); }
}

export async function byStatus(req, res, next) {
  try { res.json(await dashboardService.getByStatus()); } catch (e) { next(e); }
}

export async function evolution(req, res, next) {
  try { res.json(await dashboardService.getEvolution()); } catch (e) { next(e); }
}
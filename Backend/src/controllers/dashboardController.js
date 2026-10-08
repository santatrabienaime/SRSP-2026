import * as dashboardService from '../services/dashboardService.js';
import * as scopeService from '../services/scopeService.js';

export async function summary(req, res, next) {
  try {
    const scope = await scopeService.getScope(req.user.id);
    const [stats, files] = await Promise.all([
      dashboardService.getSummary(scope),
      dashboardService.getFilesAttente(scope),
    ]);
    res.json({
      ...stats,
      files,
      perimetre: {
        type: scope.agentScoped ? 'AGENT' : scope.divisionScoped ? 'DIVISION' : 'GLOBAL',
        libelle: scopeService.libellePerimetre(scope),
        role: scope.roleNom,
      },
    });
  } catch (e) { next(e); }
}

export async function byDivision(req, res, next) {
  try {
    const scope = await scopeService.getScope(req.user.id);
    res.json(await dashboardService.getByDivision(scope));
  } catch (e) { next(e); }
}

export async function byStatus(req, res, next) {
  try {
    const scope = await scopeService.getScope(req.user.id);
    res.json(await dashboardService.getByStatus(scope));
  } catch (e) { next(e); }
}

export async function evolution(req, res, next) {
  try {
    const scope = await scopeService.getScope(req.user.id);
    res.json(await dashboardService.getEvolution(scope));
  } catch (e) { next(e); }
}

export async function ressources(req, res, next) {
  try {
    res.json(await dashboardService.getRessources());
  } catch (e) { next(e); }
}

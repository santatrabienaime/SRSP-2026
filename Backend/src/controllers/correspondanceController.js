import * as service from '../services/mandatementService.js';

/**
 * Correspondances de la division Pensions.
 *
 * Le montage initialement prévu sous /api/dossiers a été abandonné : la route
 * générique '/:id' de dossierRoutes interceptait les requêtes avant que le
 * routeur de correspondances ne soit atteint. Correspondances vivent désormais
 * sur leur propre ressource (/api/correspondances), avec un contrôleur dédié.
 */

// Liste globale ou filtrée par dossier (?dossier_id=)
export async function getCorrespondances(req, res, next) {
  try {
    res.json(await service.getCorrespondances(req.query.dossier_id || null));
  } catch (e) { next(e); }
}

export async function createCorrespondance(req, res, next) {
  try {
    const resultat = await service.creerCorrespondance(req.body || {}, req.user.id);
    res.status(201).json(resultat);
  } catch (e) { next(e); }
}

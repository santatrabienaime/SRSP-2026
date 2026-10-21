import * as workflowService from '../services/workflowService.js';

/* Le statut se lit par `GET /dossiers/:id/statut` : c'est le même service et
   la même réponse. Ce doublon pouvait diverger du point d'entrée retenu sans
   qu'on s'en aperçoive. */

export async function transition(req, res, next) {
  try {
    const { toStatus, details } = req.body;
    const result = await workflowService.transition(
      req.params.id,
      toStatus,
      req.user.id,
      details
    );
    res.json(result);
  } catch (e) { next(e); }
}
import * as workflowService from '../services/workflowService.js';
import { envoyerMessageAction } from '../services/messageService.js';

export async function getStatus(req, res, next) {
  try {
    const status = await workflowService.getCurrentStatus(req.params.id);
    if (!status) return res.status(404).json({ message: 'Dossier introuvable.' });
    res.json({
      statut: status,
      transitions_autorisees: workflowService.getAllowedTransitions(status),
    });
  } catch (e) { next(e); }
}

export async function transition(req, res, next) {
  try {
    const { toStatus, details } = req.body;
    const result = await workflowService.transition(
      req.params.id,
      toStatus,
      req.user.id,
      details
    );
    try {
      await envoyerMessageAction({
        dossier_id: Number(req.params.id),
        action: 'TRANSITION',
        message: `Dossier #${req.params.id} passé en statut ${toStatus}.`,
        destinataire_id: req.body.destinataire_id || req.user.id,
        type: 'INFO',
      });
    } catch (e) { /* message non bloquant */ }
    res.json(result);
  } catch (e) { next(e); }
}
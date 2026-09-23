import * as workflowService from '../services/workflowService.js';

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
    res.json(result);
  } catch (e) { next(e); }
}
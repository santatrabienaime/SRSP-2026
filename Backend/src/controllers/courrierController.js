import * as courrierService from '../services/courrierService.js';
import { envoyerMessageAction } from '../services/messageService.js';

export async function list(req, res, next) {
  try { res.json(await courrierService.getCourriers(req.query)); } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try { res.json(await courrierService.getCourrierById(req.params.id)); } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const courrier = await courrierService.createCourrier(req.body, req.user.id);
    try {
      await envoyerMessageAction({
        dossier_id: courrier.dossier_id || null,
        action: 'COURRIER_CREATE',
        message: `Courrier ${courrier.numero || courrier.id} créé.`,
        destinataire_id: req.body.destinataire_id || req.user.id,
        type: 'INFO',
      });
    } catch (e) { /* message non bloquant */ }
    res.status(201).json(courrier);
  } catch (e) { next(e); }
}

export async function updateStatut(req, res, next) {
  try {
    await courrierService.updateStatut(req.params.id, req.body.statut);
    try {
      await envoyerMessageAction({
        dossier_id: null,
        action: 'COURRIER_STATUT',
        message: `Courrier #${req.params.id} statut mis à jour.`,
        destinataire_id: req.body.destinataire_id || req.user.id,
        type: 'INFO',
      });
    } catch (e) { /* message non bloquant */ }
    res.json({ message: 'Statut mis à jour.' });
  } catch (e) { next(e); }
}
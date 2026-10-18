import * as service from '../services/mandatementService.js';
import * as model from '../models/mandatementModel.js';
import { envoyerMessageAction } from '../services/messageService.js';

/* --- Mandatement --- */

export async function getMandatement(req, res, next) {
  try { res.json(await service.getMandatement(req.params.id) || null); } catch (e) { next(e); }
}

export async function saveMandatement(req, res, next) {
  try {
    const resultat = await service.enregistrerMandatement(req.params.id, req.body || {}, req.user.id);
    try {
      await envoyerMessageAction({
        dossier_id: Number(req.params.id),
        action: 'MANDATEMENT_SAVE',
        message: `Mandatement enregistré pour le dossier #${req.params.id}.`,
        destinataire_id: req.body.destinataire_id || req.user.id,
        type: 'INFO',
      });
    } catch (e) { /* message non bloquant */ }
    res.json(resultat);
  } catch (e) { next(e); }
}

export async function printPiece(req, res, next) {
  try {
    const resultat = await service.marquerPiece(req.params.id, req.body?.piece, req.user.id);
    try {
      await envoyerMessageAction({
        dossier_id: Number(req.params.id),
        action: 'MANDATEMENT_PIECE',
        message: `Pièce ${req.body?.piece} marquée pour le dossier #${req.params.id}.`,
        destinataire_id: req.body.destinataire_id || req.user.id,
        type: 'INFO',
      });
    } catch (e) { /* message non bloquant */ }
    res.json(resultat);
  } catch (e) { next(e); }
}

export async function ordonnancer(req, res, next) {
  try {
    const resultat = await service.ordonnancer(req.params.id, req.user.id);
    try {
      await envoyerMessageAction({
        dossier_id: Number(req.params.id),
        action: 'MANDATEMENT_ORDONNANCE',
        message: `Dossier #${req.params.id} ordonné.`,
        destinataire_id: req.body.destinataire_id || req.user.id,
        type: 'INFO',
      });
    } catch (e) { /* message non bloquant */ }
    res.json(resultat);
  } catch (e) { next(e); }
}

export async function liquider(req, res, next) {
  try {
    const resultat = await service.liquider(req.params.id, req.user.id);
    try {
      await envoyerMessageAction({
        dossier_id: Number(req.params.id),
        action: 'MANDATEMENT_LIQUIDATION',
        message: `Dossier #${req.params.id} liquidé.`,
        destinataire_id: req.body.destinataire_id || req.user.id,
        type: 'INFO',
      });
    } catch (e) { /* message non bloquant */ }
    res.json(resultat);
  } catch (e) { next(e); }
}

export async function listPieces(req, res, next) {
  try {
    res.json(await model.chargerPiecesReference());
  } catch (e) { next(e); }
}

import * as service from '../services/depouillementService.js';
import { envoyerMessageAction } from '../services/messageService.js';

export async function checklist(req, res, next) {
  try { res.json(await service.getChecklist(req.params.id)); } catch (error) { next(error); }
}

export async function controler(req, res, next) {
  try {
    const { piece, presente, observation } = req.body || {};
    if (!piece) {
      return res.status(400).json({ message: 'La pièce à contrôler est obligatoire.' });
    }
    const resultat = await service.controlerPiece(
      req.params.id,
      { piece, presente: !!presente, observation },
      req.user.id
    );
    try {
      await envoyerMessageAction({
        dossier_id: Number(req.params.id),
        action: 'DEPOUILEMENT_CONTROL',
        message: `Pièce ${piece} contrôlée (${presente ? 'présente' : 'absente'}) pour le dossier #${req.params.id}.`,
        destinataire_id: req.body.destinataire_id || req.user.id,
        type: 'INFO',
      });
    } catch (e) { /* message non bloquant */ }
    res.json(resultat);
  } catch (error) { next(error); }
}

export async function historique(req, res, next) {
  try {
    res.json(await service.getHistorique(req.params.id));
  } catch (error) { next(error); }
}

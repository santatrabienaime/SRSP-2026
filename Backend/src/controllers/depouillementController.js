import * as service from '../services/depouillementService.js';

export async function checklist(req, res, next) {
  try { res.json(await service.getChecklist(req.params.id)); } catch (error) { next(error); }
}

export async function controler(req, res, next) {
  try {
    const { piece, presente, etat, observation, motif } = req.body || {};
    if (!piece) {
      return res.status(400).json({ message: 'La pièce à contrôler est obligatoire.' });
    }
    const resultat = await service.controlerPiece(
      req.params.id,
      { piece, presente: !!presente, etat, observation, motif },
      req.user.id
    );
    res.json(resultat);
  } catch (error) { next(error); }
}

export async function historique(req, res, next) {
  try {
    res.json(await service.getHistorique(req.params.id));
  } catch (error) { next(error); }
}

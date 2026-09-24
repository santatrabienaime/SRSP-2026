import * as service from '../services/depouillementService.js';

export async function checklist(req, res, next) {
  try {
    res.json(await service.getChecklist(req.params.id));
  } catch (error) { next(error); }
}

export async function controler(req, res, next) {
  try {
    const { piece, presente, observation } = req.body || {};
    if (!piece) {
      return res.status(400).json({ message: 'La pièce à contrôler est obligatoire.' });
    }
    res.json(
      await service.controlerPiece(
        req.params.id,
        { piece, presente: !!presente, observation },
        req.user.id
      )
    );
  } catch (error) { next(error); }
}

export async function historique(req, res, next) {
  try {
    res.json(await service.getHistorique(req.params.id));
  } catch (error) { next(error); }
}

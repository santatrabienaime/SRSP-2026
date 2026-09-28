import express from 'express';
import * as service from '../services/commentaireService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { assertDossierAccessMiddleware } from '../middlewares/scopeDossiersMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// Commentaires internes : accessibles à qui peut consulter le dossier.
// assertDossierAccessMiddleware applique le cloisonnement inter-division.
router.get('/:id/commentaires', assertDossierAccessMiddleware, async (req, res, next) => {
  try {
    res.json(await service.getComments(req.params.id));
  } catch (e) { next(e); }
});

router.post('/:id/commentaires', assertDossierAccessMiddleware, async (req, res, next) => {
  try {
    res.status(201).json(
      await service.addComment(req.params.id, req.body?.contenu, req.user)
    );
  } catch (e) { next(e); }
});

router.delete('/:id/commentaires/:cid', assertDossierAccessMiddleware, async (req, res, next) => {
  try {
    res.json(await service.deleteComment(req.params.cid, req.user));
  } catch (e) { next(e); }
});

export default router;

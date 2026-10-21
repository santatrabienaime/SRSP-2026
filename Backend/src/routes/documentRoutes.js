import express from 'express';
import * as ctrl from '../controllers/documentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';
import { assertDossierAccessMiddleware } from '../middlewares/scopeDossiersMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* Les routes sont montées sous /api/dossiers : le dossier et sa pièce sont
   toujours lus ensemble, ce qui interdit de télécharger la pièce d'un autre
   dossier en changeant un identifiant. */
router.get('/:id/documents', assertDossierAccessMiddleware, ctrl.list);

router.post(
  '/:id/documents',
  rbacMiddleware(['upload_document', 'manage_documents']),
  assertDossierAccessMiddleware,
  uploadSingle('fichier'),
  ctrl.upload
);

router.get(
  '/:id/documents/:documentId/fichier',
  assertDossierAccessMiddleware,
  ctrl.download
);

router.delete(
  '/:id/documents/:documentId',
  rbacMiddleware(['upload_document', 'manage_documents']),
  assertDossierAccessMiddleware,
  ctrl.remove
);

export default router;

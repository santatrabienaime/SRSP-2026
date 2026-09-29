import express from 'express';
import * as ctrl from '../controllers/documentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
/* Fiche d'un document. Declaree avant `/:id/download` : l'ordre des routes
   n'importe pas ici, mais le laisser explicite evite qu'une route ajoutee
   apres absorbe silencieusement les autres. */
router.get('/:id', ctrl.getOne);
router.get('/:id/download', ctrl.download);
router.post('/', rbacMiddleware('upload_document'), uploadSingle('fichier'), ctrl.upload);
router.put('/:id/valider', ctrl.valider);
router.delete('/:id', ctrl.remove);

export default router;
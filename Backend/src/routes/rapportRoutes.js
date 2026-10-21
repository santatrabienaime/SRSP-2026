import express from 'express';
import * as ctrl from '../controllers/rapportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* ─── Rapports Secrétaire (view_stats + export_data) ─── */

// 1. Rapport journalier des dossiers reçus
router.get('/journalier-recus/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.journalierRecusPdf);
router.get('/journalier-recus/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.journalierRecusExcel);

// 2. Liste des dossiers enregistrés par période
router.get('/dossiers-periode/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.dossiersPeriodePdf);
router.get('/dossiers-periode/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.dossiersPeriodeExcel);

// 3. Liste des dossiers en attente de transmission
router.get('/attente-transmission/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.attenteTransmissionPdf);
router.get('/attente-transmission/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.attenteTransmissionExcel);

// 4. Liste des dossiers incomplets
router.get('/incomplets/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.incompletsPdf);
router.get('/incomplets/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.incompletsExcel);

// 5. Liste des dossiers retournés
router.get('/retournes/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.retournesPdf);
router.get('/retournes/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.retournesExcel);

// 6. Rapport des transmissions par division
router.get('/transmissions-division/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.transmissionsDivisionPdf);
router.get('/transmissions-division/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.transmissionsDivisionExcel);

// 7. Registre des courriers entrants et sortants
router.get('/registre-courriers/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.registreCourriersPdf);
router.get('/registre-courriers/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.registreCourriersExcel);

// 7. Liste des dossiers clôturés
router.get('/clotures/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.cloturesPdf);
router.get('/clotures/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.cloturesExcel);

// 9. Liste des dossiers archivés
router.get('/archives/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.archivesPdf);
router.get('/archives/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.archivesExcel);

// 10. Statistiques par type de dossier, période et division
router.get('/stats-type-periode-division/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.statsParTypePeriodeDivisionPdf);
router.get('/stats-type-periode-division/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.statsParTypePeriodeDivisionExcel);

// 11. Dossiers VISA : période mensuelle, trimestrielle ou annuelle
router.get('/visa/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.visaPdf);
router.get('/visa/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.visaExcel);

// 12. Dossiers VISA par vérificateur
router.get('/visa-par-verificateur/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.visaParVerificateurPdf);
router.get('/visa-par-verificateur/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.visaParVerificateurExcel);

// 13. Opérations par division (Solde, Pensions, Secours)
router.get('/operations/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.operationDivisionPdf);
router.get('/operations/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.operationDivisionExcel);

// 14. Opérations par division et par type
router.get('/operations-par-type/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.operationParTypePdf);
router.get('/operations-par-type/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.operationParTypeExcel);

// 15. Suivi des dossiers Secours de décès
router.get('/secours/pdf', rbacMiddleware(['view_stats', 'export_data']), ctrl.secoursPdf);
router.get('/secours/excel', rbacMiddleware(['view_stats', 'export_data']), ctrl.secoursExcel);

/* ─── Endpoints originaux (compatibilité) ─── */

router.get('/pdf', ctrl.pdf);
router.get('/excel', ctrl.excel);

export default router;
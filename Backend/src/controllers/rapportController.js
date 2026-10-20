import * as rapportService from '../services/rapportService.js';

export async function pdf(req, res, next) {
  try { await rapportService.generatePDF(res, req.query); } catch (e) { next(e); }
}

export async function excel(req, res, next) {
  try { await rapportService.generateExcel(res); } catch (e) { next(e); }
}

/* ─── Nouveaux endpoints pour les 10 rapports Secrétaire ─── */

// 1. Rapport journalier des dossiers reçus
export async function journalierRecusPdf(req, res, next) {
  try { await rapportService.pdfJournalierRecus(res, req.query); } catch (e) { next(e); }
}
export async function journalierRecusExcel(req, res, next) {
  try { await rapportService.excelJournalierRecus(res, req.query); } catch (e) { next(e); }
}

// 2. Liste des dossiers enregistrés par période
export async function dossiersPeriodePdf(req, res, next) {
  try { await rapportService.pdfDossiersPeriode(res, req.query); } catch (e) { next(e); }
}
export async function dossiersPeriodeExcel(req, res, next) {
  try { await rapportService.excelDossiersPeriode(res, req.query); } catch (e) { next(e); }
}

// 3. Liste des dossiers en attente de transmission
export async function attenteTransmissionPdf(req, res, next) {
  try { await rapportService.pdfAttenteTransmission(res, req.query); } catch (e) { next(e); }
}
export async function attenteTransmissionExcel(req, res, next) {
  try { await rapportService.excelAttenteTransmission(res, req.query); } catch (e) { next(e); }
}

// 4. Liste des dossiers incomplets
export async function incompletsPdf(req, res, next) {
  try { await rapportService.pdfIncomplets(res, req.query); } catch (e) { next(e); }
}
export async function incompletsExcel(req, res, next) {
  try { await rapportService.excelIncomplets(res, req.query); } catch (e) { next(e); }
}

// 5. Liste des dossiers retournés
export async function retournesPdf(req, res, next) {
  try { await rapportService.pdfRetournes(res, req.query); } catch (e) { next(e); }
}
export async function retournesExcel(req, res, next) {
  try { await rapportService.excelRetournes(res, req.query); } catch (e) { next(e); }
}

// 6. Rapport des transmissions par division
export async function transmissionsDivisionPdf(req, res, next) {
  try { await rapportService.pdfTransmissionsDivision(res, req.query); } catch (e) { next(e); }
}
export async function transmissionsDivisionExcel(req, res, next) {
  try { await rapportService.excelTransmissionsDivision(res, req.query); } catch (e) { next(e); }
}

// 7. Registre des courriers entrants et sortants
export async function registreCourriersPdf(req, res, next) {
  try { await rapportService.pdfRegistreCourriers(res, req.query); } catch (e) { next(e); }
}
export async function registreCourriersExcel(req, res, next) {
  try { await rapportService.excelRegistreCourriers(res, req.query); } catch (e) { next(e); }
}

// 8. Liste des dossiers clôturés
export async function cloturesPdf(req, res, next) {
  try { await rapportService.pdfClotures(res, req.query); } catch (e) { next(e); }
}
export async function cloturesExcel(req, res, next) {
  try { await rapportService.excelClotures(res, req.query); } catch (e) { next(e); }
}

// 9. Liste des dossiers archivés
export async function archivesPdf(req, res, next) {
  try { await rapportService.pdfArchives(res, req.query); } catch (e) { next(e); }
}
export async function archivesExcel(req, res, next) {
  try { await rapportService.excelArchives(res, req.query); } catch (e) { next(e); }
}

// 10. Statistiques par type de dossier, période et division
export async function statsParTypePeriodeDivisionPdf(req, res, next) {
  try { await rapportService.pdfStatsParTypePeriodeDivision(res, req.query); } catch (e) { next(e); }
}
export async function statsParTypePeriodeDivisionExcel(req, res, next) {
  try { await rapportService.excelStatsParTypePeriodeDivision(res, req.query); } catch (e) { next(e); }
}
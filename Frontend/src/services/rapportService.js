import apiClient from './apiClient.js';

export const rapportService = {
  pdf: (params) =>
    apiClient.get('/rapports/pdf', { params, responseType: 'blob' }).then((r) => r.data),
  excel: () =>
    apiClient.get('/rapports/excel', { responseType: 'blob' }).then((r) => r.data),

  // Nouveaux rapports Secrétaire
  journalierRecus: {
    pdf: (params) =>
      apiClient.get('/rapports/journalier-recus/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/journalier-recus/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  dossiersPeriode: {
    pdf: (params) =>
      apiClient.get('/rapports/dossiers-periode/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/dossiers-periode/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  attenteTransmission: {
    pdf: (params) =>
      apiClient.get('/rapports/attente-transmission/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/attente-transmission/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  incomplets: {
    pdf: (params) =>
      apiClient.get('/rapports/incomplets/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/incomplets/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  retournes: {
    pdf: (params) =>
      apiClient.get('/rapports/retournes/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/retournes/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  transmissionsDivision: {
    pdf: (params) =>
      apiClient.get('/rapports/transmissions-division/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/transmissions-division/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  registreCourriers: {
    pdf: (params) =>
      apiClient.get('/rapports/registre-courriers/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/registre-courriers/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  clotures: {
    pdf: (params) =>
      apiClient.get('/rapports/clotures/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/clotures/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  archives: {
    pdf: (params) =>
      apiClient.get('/rapports/archives/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/archives/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  statsTypePeriodeDivision: {
    pdf: (params) =>
      apiClient.get('/rapports/stats-type-periode-division/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/stats-type-periode-division/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  visa: {
    pdf: (params) =>
      apiClient.get('/rapports/visa/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/visa/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  visaParVerificateur: {
    pdf: (params) =>
      apiClient.get('/rapports/visa-par-verificateur/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/visa-par-verificateur/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  /* ── Rapports par division (§ 12.4) ──────────────────────────────
     Les opérations sont portées par le type d'opération du dossier : un
     rapport paramétré par division suffit, et il suit automatiquement les
     opérations que le SRSP ajoutera au référentiel. */
  operationDivision: {
    pdf: (params) =>
      apiClient.get('/rapports/operations/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/operations/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  operationParType: {
    pdf: (params) =>
      apiClient.get('/rapports/operations-par-type/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/operations-par-type/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
  secours: {
    pdf: (params) =>
      apiClient.get('/rapports/secours/pdf', { params, responseType: 'blob' }).then((r) => r.data),
    excel: (params) =>
      apiClient.get('/rapports/secours/excel', { params, responseType: 'blob' }).then((r) => r.data),
  },
};

export default rapportService;
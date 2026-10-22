import apiClient from './apiClient.js';

import { extractValue } from '../utils/extractValue.js';

export const dashboardService = {
  summary: () => apiClient.get('/dashboard/summary').then((r) => {
    const d = r.data || {};
    /* Le serveur renvoie deux blocs : les agrégats par statut (à plat) et les
       files d'attente sous `files`. On aplatit les deux ici, en un seul endroit,
       pour que les écrans n'aient pas à connaître la forme de la réponse. */
    const files = d.files || {};
    return {
      total: extractValue(d.total),
      enRetard: extractValue(d.enRetard),
      // Dossiers à priorité haute ou urgente (triage « Urgents »).
      prioritaires: extractValue(d.prioritaires),

      // Statuts individuels, utilisés par le triage de la liste des dossiers.
      RECU: extractValue(d.RECU),
      ENREGISTRE: extractValue(d.ENREGISTRE),
      ORIENTE: extractValue(d.ORIENTE),
      AFFECTE: extractValue(d.AFFECTE),
      EN_TRAITEMENT: extractValue(d.EN_TRAITEMENT),
      EN_ATTENTE_COMPLEMENT: extractValue(d.EN_ATTENTE_COMPLEMENT),
      SOUMIS_A_VERIFICATION: extractValue(d.SOUMIS_A_VERIFICATION),
      CORRECTION_DEMANDEE: extractValue(d.CORRECTION_DEMANDEE),
      VALIDE: extractValue(d.VALIDE),
      SIGNE: extractValue(d.SIGNE),
      CLOTURE: extractValue(d.CLOTURE),
      ARCHIVE: extractValue(d.ARCHIVE),

      // Files d'attente par rôle (bloc `files` du serveur).
      aOrienter: extractValue(files.aOrienter),
      aAffecter: extractValue(files.aAffecter),
      aTraiter: extractValue(files.aTraiter),
      enCours: extractValue(files.enCours),
      aCorriger: extractValue(files.aCorriger),
      aVerifier: extractValue(files.aVerifier),
      aValider: extractValue(files.aValider),
      aSigner: extractValue(files.aSigner),
      aCloturer: extractValue(files.aCloturer),
      aArchiver: extractValue(files.aArchiver),
      termines: extractValue(files.termines),

      // Bloc brut conservé : certains écrans (DashboardPage) lisent `files`.
      files,
      perimetre: d.perimetre || null,
    };
  }),
  /**
   * Boîte de travail : ce qui incombe à l'utilisateur, ce qui attend une
   * validation, ce qui est incomplet et ce qui a été clôturé récemment.
   *
   * Le serveur renvoie quatre files et deux répartitions. On garde la forme
   * brute : chaque file porte son `total` et ses `dossiers`, et l'écran se
   * charge de la présenter — aucune donnée n'est recalculée côté client.
   */
  boiteTravail: (tri) =>
    apiClient.get('/dashboard/boite-travail', { params: tri ? { tri } : undefined })
      .then((r) => r.data || {}),
  byDivision: () => apiClient.get('/dashboard/by-division').then((r) => r.data || []),
  byStatus: () => apiClient.get('/dashboard/by-status').then((r) => r.data || []),
  evolution: () => apiClient.get('/dashboard/evolution').then((r) => r.data || []),
  ressources: () => apiClient.get('/dashboard/ressources').then((r) => r.data || {}),
  secretaireKPIs: () => apiClient.get('/dashboard/secretaire-kpis').then((r) => r.data || {}),
};

export default dashboardService;
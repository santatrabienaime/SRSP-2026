/**
 * Triage des dossiers : tris et regroupements.
 *
 * Le triage répond à deux besoins du quotidien :
 *   - trouver le dossier qu'on doit traiter maintenant (le tri) ;
 *   - voir d'un coup d'œil où en est le service (le regroupement par statut).
 *
 * L'ordre des statuts est celui du circuit : il est tenu par la colonne
 * `ordre` de `statuts_dossiers`. Le frontend le reproduit ici pour classer
 * les dossiers sans redemander le référentiel à chaque écran. Toute
 * divergence se verrait tout de suite : le tableau de bord affiche les
 * statuts dans le même ordre.
 *
 * Un tri n'est qu'un ordre d'affichage : il ne change ni le contenu de la
 * liste, ni les droits, ni l'état d'un dossier.
 */
import { STATUTS, STATUT_LABELS } from './constants.js';

/** Les statuts dans l'ordre du circuit. */
export const ORDRE_CIRCUIT = [
  STATUTS.BROUILLON,
  STATUTS.RECU,
  STATUTS.ENREGISTRE,
  STATUTS.ORIENTE,
  STATUTS.AFFECTE,
  STATUTS.EN_TRAITEMENT,
  STATUTS.EN_ATTENTE_COMPLEMENT,
  STATUTS.SOUMIS_A_VERIFICATION,
  STATUTS.CORRECTION_DEMANDEE,
  STATUTS.VALIDE,
  STATUTS.SIGNE,
  STATUTS.CLOTURE,
  STATUTS.ARCHIVE,
];

/** Tris de la liste des dossiers. */
export const TRIS_DOSSIERS = [
  { value: 'prioritaire', label: 'À traiter en premier' },
  { value: 'niveau', label: 'Niveau de priorité (urgent d’abord)' },
  { value: 'niveau_asc', label: 'Niveau de priorité (faible d’abord)' },
  { value: 'statut', label: 'Statut du circuit' },
  { value: 'statut_desc', label: 'Statut du circuit (inverse)' },
  { value: 'echeance', label: 'Échéance la plus proche' },
  { value: 'priorite', label: 'Priorité' },
  { value: 'ancien', label: 'Plus anciens d’abord' },
  { value: 'recent', label: 'Plus récents d’abord' },
  { value: 'numero', label: 'Numéro de dossier' },
  { value: 'type', label: 'Type de dossier' },
  { value: 'division', label: 'Division' },
  { value: 'agent', label: 'Agent responsable' },
  { value: 'demandeur', label: 'Demandeur' },
  { value: 'signalement', label: 'Dossiers signalés' },
];

/**
 * Tris de la boîte de travail.
 *
 * La boîte montre un aperçu de chaque file : le tri doit donc porter sur les
 * mêmes critères que la liste, à l'exception du signalement — la boîte ne
 * le connaît pas.
 */
export const TRIS_BOITE = [
  { value: 'prioritaire', label: 'À traiter en premier' },
  { value: 'niveau', label: 'Niveau de priorité (urgent d’abord)' },
  { value: 'niveau_asc', label: 'Niveau de priorité (faible d’abord)' },
  { value: 'statut', label: 'Statut du circuit' },
  { value: 'echeance', label: 'Échéance la plus proche' },
  { value: 'priorite', label: 'Priorité' },
  { value: 'ancien', label: 'Plus anciens d’abord' },
  { value: 'recent', label: 'Plus récents d’abord' },
  { value: 'numero', label: 'Numéro de dossier' },
  { value: 'type', label: 'Type de dossier' },
  { value: 'division', label: 'Division' },
  { value: 'agent', label: 'Agent responsable' },
  { value: 'demandeur', label: 'Demandeur' },
];

/** Rang d'un statut dans le circuit (les statuts inconnus passent après). */
export function rangStatut(code) {
  const rang = ORDRE_CIRCUIT.indexOf(code);
  return rang === -1 ? ORDRE_CIRCUIT.length : rang;
}

/**
 * Regroupe des dossiers par statut, dans l'ordre du circuit.
 *
 * Chaque groupe porte son libellé et son effectif : c'est ce qui permet de
 * lire la file d'un coup d'œil et de repérer la surcharge d'un statut.
 * Les groupes vides ne sont pas produits — une section à zéro n'apprend rien.
 */
export function grouperParStatut(dossiers = []) {
  const groupes = new Map();
  for (const dossier of dossiers) {
    const code = dossier.statut_code || 'INCONNU';
    if (!groupes.has(code)) groupes.set(code, []);
    groupes.get(code).push(dossier);
  }
  return [...groupes.entries()]
    .sort((a, b) => rangStatut(a[0]) - rangStatut(b[0]) || a[0].localeCompare(b[0]))
    .map(([code, liste]) => ({
      code,
      label: STATUT_LABELS[code] || code,
      dossiers: liste,
      total: liste.length,
    }));
}

/**
 * Regroupe des dossiers par niveau de priorité.
 *
 * Le niveau vient du référentiel : URGENTE = 4, HAUTE = 3, NORMALE = 2,
 * BASSE = 1. Un tri décroissant place donc les urgents en tête, comme la
 * liste triée par « niveau ». Le libellé du groupe est celui de la priorité
 * (« URGENTE »), le niveau chiffré reste disponible pour l'en-tête.
 *
 * Les dossiers sans priorité connue sont regroupés sous le niveau 0, en
 * dernier : ils ne doivent ni disparaître, ni se mêler aux urgents.
 */
export function grouperParNiveau(dossiers = []) {
  const groupes = new Map();
  for (const dossier of dossiers) {
    const niveau = Number(dossier.priorite_niveau) || 0;
    if (!groupes.has(niveau)) {
      groupes.set(niveau, {
        niveau,
        label: dossier.priorite_libelle || 'Priorité non renseignée',
        dossiers: [],
      });
    }
    groupes.get(niveau).dossiers.push(dossier);
  }
  return [...groupes.values()]
    .sort((a, b) => b.niveau - a.niveau)
    .map((g) => ({
      code: `NIVEAU_${g.niveau}`,
      niveau: g.niveau,
      label: g.label,
      dossiers: g.dossiers,
      total: g.dossiers.length,
    }));
}

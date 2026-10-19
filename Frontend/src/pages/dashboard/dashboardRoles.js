import {
  FolderKanban, Stamp, ShieldCheck, FileBarChart2, BarChart3,
  FilePlus2, MailPlus, Compass, Clock, AlertTriangle, Inbox,
} from 'lucide-react';
import { extractValue } from '../../utils/extractValue.js';

/**
 * Tableaux de bord par rôle — spec UI-DASHBOARDS V2.0, lot pilote.
 *
 * Quatre rôles sont couverts : Chef de Service, Secrétaire, Chef BAAF,
 * Coordonnatrice. Chaque configuration ne référence que des fonctions
 * réellement présentes dans la plateforme : les fonctions supprimées
 * (immatriculations, Augure, paiements, actes, personnel du BAAF) ou non
 * construites (congés, situations FCC/BCSE du référentiel) n'ont pas de KPI —
 * un chiffre sans source de données mentirait sur l'état du service.
 *
 * Les rôles non couverts ici (Admin, chefs et vérificateurs de division)
 * retombent sur la configuration par périmètre — agent / division / global —
 * de DashboardPage.
 *
 * `charts` pilote le rendu : 'statut' et 'division' partagent une grille à
 * deux colonnes, 'evolution' occupe toute la largeur.
 */

const CONFIG = {
  /* Spec §2 : total, validations, signatures, retards + répartition par
     division + actions de validation/signature. */
  CHEF_SERVICE: {
    titre: 'Tableau de bord — Chef de Service',
    sousTitre: "Validations, signatures et vue d'ensemble du service.",
    kpis: ({ s, files }) => [
      { icon: FolderKanban, label: 'Total dossiers', value: extractValue(s?.total), tone: 'primary', sub: 'Toutes divisions' },
      { icon: ShieldCheck, label: 'À valider', value: extractValue(files?.aValider), tone: 'violet', sub: 'Soumis à vérification' },
      { icon: Stamp, label: 'À signer', value: extractValue(files?.aSigner), tone: 'amber', sub: 'Validés' },
      { icon: Inbox, label: 'Nouveaux reçus', value: extractValue(files?.aOrienter), tone: 'blue', sub: 'Nouveaux dossiers reçus' },
      { icon: AlertTriangle, label: 'En retard', value: extractValue(s?.enRetard), tone: 'red', sub: '> 30 jours' },
    ],
    actions: [
      { to: '/dossiers', label: 'Valider un dossier', icon: ShieldCheck, perms: ['valider_dossier'] },
      { to: '/dossiers', label: 'Signer un dossier', icon: Stamp, perms: ['signer_dossier'] },
      { to: '/rapports', label: 'Voir les rapports', icon: FileBarChart2, perms: ['view_stats', 'consolidate_reports', 'export_data'] },
      { to: '/statistiques', label: 'Consulter les statistiques', icon: BarChart3, perms: ['view_stats'] },
    ],
    charts: ['division'],
  },

  /* Spec §3 : réception, enregistrement, orientation. Le menu « Actes » de la
     maquette a été supprimé avec la chronologie : il n'a pas de KPI. */
  SECRETAIRE: {
    titre: 'Tableau de bord — Secrétaire',
    sousTitre: 'Réception, enregistrement, orientation et suivi des dossiers.',
    // Les KPIs sont enrichis par secretaireKPIs (chargé dans DashboardPage)
    kpis: ({ s, files, ress, sk }) => [
      // Ligne 1 : Volume réception
      { icon: Inbox, label: 'Total reçus', value: extractValue(sk?.totalRecus ?? s?.RECU), tone: 'blue', sub: 'Statut REÇU' },
      { icon: Inbox, label: 'Reçus aujourd\'hui', value: extractValue(sk?.recusAujourdhui), tone: 'blue', sub: 'Date du jour' },
      { icon: FilePlus2, label: 'Attente enregistrement', value: extractValue(sk?.attenteEnregistrementComplet), tone: 'amber', sub: 'REÇU + ENREGISTRÉ non orientés' },
      { icon: Compass, label: 'À transmettre', value: extractValue(sk?.aTransmettreDivisions ?? files?.aOrienter), tone: 'amber', sub: 'Orientés, en attente transmission' },
      // Ligne 2 : Suivi & alertes
      { icon: AlertTriangle, label: 'Incomplets', value: extractValue(sk?.incomplets), tone: 'red', sub: 'Pièces obligatoires manquantes' },
      { icon: ArrowRight, label: 'Retournés divisions', value: extractValue(sk?.retournesDivisions ?? s?.CORRECTION_DEMANDEE), tone: 'red', sub: 'Correction demandée' },
      { icon: Clock, label: 'Transmis (attente confirmation)', value: extractValue(sk?.transmisAttenteConfirmation), tone: 'sky', sub: 'Bordereau envoyé, réception non confirmée' },
      { icon: Archive, label: 'Clôturés (attente archivage)', value: extractValue(sk?.cloturesAttenteArchivage ?? s?.CLOTURE), tone: 'violet', sub: 'Signés, non archivés' },
      // Ligne 3 : Notifications & priorités
      { icon: Bell, label: 'Notifications', value: extractValue(sk?.notificationsNonLues), tone: 'emerald', sub: 'Non lues' },
      { icon: ShieldCheck, label: 'Tâches prioritaires', value: extractValue(sk?.tachesPrioritaires), tone: 'amber', sub: 'Dossiers prioritaires en attente' },
    ],
    actions: [
      { to: '/dossiers/nouveau', label: 'Nouveau dossier', icon: FilePlus2, perms: ['create_dossier'] },
      { to: '/courriers/nouveau', label: 'Nouveau courrier', icon: MailPlus, perms: ['manage_courriers'] },
      { to: '/dossiers', label: 'Orienter un dossier', icon: Compass, perms: ['orienter_dossier'] },
      { to: '/dossiers', label: 'Transmettre (bordereau)', icon: Send, perms: ['create_dossier'] },
    ],
    charts: [],
    liste: { titre: 'Derniers dossiers reçus' },
  },

  /* Spec §4, sans personnel/congés/FCC-BCSE (supprimés ou non construits) :
     documents comptables, pièces de déplacement, secrétariat. */
  CHEF_BAAF: {
    titre: 'Tableau de bord — Chef BAAF',
    sousTitre: 'Secrétariat et courriers.',
    kpis: ({ ress }) => [
      { icon: MailPlus, label: 'Courriers', value: extractValue(ress?.courriers?.total), tone: 'violet', sub: 'Courriers du service' },
    ],
    actions: [
      { to: '/courriers/nouveau', label: 'Nouveau courrier', icon: MailPlus, perms: ['manage_courriers'] },
      { to: '/rapports', label: 'Rapports', icon: FileBarChart2, perms: ['consolidate_reports'] },
    ],
    charts: [],
  },

  /* Spec §5, sans immatriculation/Augure/paiement (supprimés ou non construits) :
     elle suit désormais les dossiers et produit la statistique. */
  COORDINATRICE: {
    titre: 'Tableau de bord — Coordonnatrice',
    sousTitre: 'Suivi des dossiers du service et production statistique.',
    kpis: ({ s, files }) => [
      { icon: FolderKanban, label: 'Total dossiers', value: extractValue(s?.total), tone: 'primary', sub: 'Toutes divisions' },
      { icon: Inbox, label: 'Nouveaux reçus', value: extractValue(s?.RECU), tone: 'blue', sub: "Dossiers reçus récents" },
      { icon: Clock, label: 'En traitement', value: extractValue(files?.enCours), tone: 'sky', sub: 'Dossiers en cours' },
      { icon: AlertTriangle, label: 'À corriger', value: extractValue(files?.aCorriger), tone: 'red', sub: 'Retours en attente' },
      { icon: AlertTriangle, label: 'En retard', value: extractValue(s?.enRetard), tone: 'amber', sub: '> 30 jours' },
    ],
    actions: [
      { to: '/statistiques', label: 'Statistiques', icon: BarChart3, perms: ['view_stats'] },
      { to: '/rapports', label: 'Rapports', icon: FileBarChart2, perms: ['view_stats', 'consolidate_reports', 'export_data'] },
      { to: '/dossiers', label: 'Dossiers', icon: FolderKanban },
    ],
    charts: ['division'],
  },
};

/**
 * Configuration d'un rôle, KPIs calculés sur les données chargées.
 * Renvoie null pour un rôle non couvert (le tri par périmètre prend le relais).
 *
 * Données : s (summary), files (files d'attente du summary),
 * ress (comptes courriers/documents).
 */
export function configRole(role, data) {
  const cfg = CONFIG[role];
  if (!cfg) return null;
  return { ...cfg, kpis: cfg.kpis(data) };
}
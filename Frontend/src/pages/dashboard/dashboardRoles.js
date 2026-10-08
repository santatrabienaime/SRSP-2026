import {
  FolderKanban, FileText, Stamp, ShieldCheck, FileBarChart2, BarChart3,
  FilePlus2, MailPlus, Compass, Upload, Clock, AlertTriangle, Route, Inbox,
} from 'lucide-react';

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

/** Le serveur peut renvoyer un compteur absent : la carte affiche « — ». */
const n = (v) => (typeof v === 'number' ? v : undefined);

const CONFIG = {
  /* Spec §2 : total, validations, signatures, retards + répartition par
     division + actions de validation/signature. */
  CHEF_SERVICE: {
    titre: 'Tableau de bord — Chef de Service',
    sousTitre: "Validations, signatures et vue d'ensemble du service.",
    kpis: ({ s, files }) => [
      { icon: FolderKanban, label: 'Total dossiers', value: n(s?.total), tone: 'primary', sub: 'Toutes divisions' },
      { icon: ShieldCheck, label: 'À valider', value: n(files?.aValider), tone: 'violet', sub: 'Soumis à vérification' },
      { icon: Stamp, label: 'À signer', value: n(files?.aSigner), tone: 'amber', sub: 'Validés' },
      { icon: AlertTriangle, label: 'En retard', value: n(s?.enRetard), tone: 'red', sub: '> 30 jours' },
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
    sousTitre: 'Réception, enregistrement et orientation des dossiers.',
    kpis: ({ s, files, ress }) => [
      { icon: Inbox, label: 'Reçus', value: n(s?.RECU), tone: 'primary', sub: "En attente d'enregistrement" },
      { icon: Route, label: 'À orienter', value: n(files?.aOrienter), tone: 'amber', sub: 'Enregistrés / orientés' },
      { icon: MailPlus, label: 'Courriers', value: n(ress?.courriers?.total), tone: 'sky', sub: `Reçus : ${ress?.courriers?.recus ?? 0}` },
      { icon: FolderKanban, label: 'Total dossiers', value: n(s?.total), tone: 'violet', sub: 'Tous statuts' },
    ],
    actions: [
      { to: '/dossiers/nouveau', label: 'Nouveau dossier', icon: FilePlus2, perms: ['create_dossier'] },
      { to: '/courriers/nouveau', label: 'Nouveau courrier', icon: MailPlus, perms: ['manage_courriers'] },
      { to: '/dossiers', label: 'Orienter un dossier', icon: Compass, perms: ['orienter_dossier'] },
    ],
    charts: [],
    liste: { titre: 'Derniers dossiers reçus' },
  },

  /* Spec §4, sans personnel/congés/FCC-BCSE (supprimés ou non construits) :
     documents comptables, pièces de déplacement, secrétariat. */
  CHEF_BAAF: {
    titre: 'Tableau de bord — Chef BAAF',
    sousTitre: 'Documents comptables, pièces de déplacement et secrétariat.',
    kpis: ({ ress, ordres }) => [
      { icon: FileText, label: 'Documents', value: n(ress?.documents?.total), tone: 'primary', sub: 'Documents comptables' },
      { icon: Route, label: 'Pièces de déplacement', value: n(ordres?.tdb?.total), tone: 'sky', sub: "Ordres et notes d'intérim" },
      { icon: Stamp, label: 'Ordres à signer', value: n(ordres?.tdb?.a_signer), tone: 'amber', sub: 'En attente du Chef de Service' },
      { icon: MailPlus, label: 'Courriers', value: n(ress?.courriers?.total), tone: 'violet', sub: 'Courriers du service' },
    ],
    actions: [
      { to: '/baaf/pieces-deplacement', label: 'Établir une pièce', icon: FileText, perms: ['etablir_pieces_deplacement'] },
      { to: '/documents/upload', label: 'Déposer un document', icon: Upload, perms: ['upload_document'] },
      { to: '/courriers/nouveau', label: 'Nouveau courrier', icon: MailPlus, perms: ['manage_courriers'] },
      { to: '/rapports', label: 'Rapports', icon: FileBarChart2, perms: ['consolidate_reports'] },
    ],
    charts: ['statut'],
    listeOrdres: true,
  },

  /* Spec §5, sans immatriculation/Augure/paiement (pages supprimées) :
     elle suit désormais les dossiers et produit les statistiques. */
  COORDINATRICE: {
    titre: 'Tableau de bord — Coordonnatrice',
    sousTitre: 'Suivi des dossiers du service et production statistique.',
    kpis: ({ s, files }) => [
      { icon: FolderKanban, label: 'Total dossiers', value: n(s?.total), tone: 'primary', sub: 'Toutes divisions' },
      { icon: Clock, label: 'En traitement', value: n(files?.enCours), tone: 'sky', sub: 'Dossiers en cours' },
      { icon: AlertTriangle, label: 'À corriger', value: n(files?.aCorriger), tone: 'red', sub: 'Retours en attente' },
      { icon: AlertTriangle, label: 'En retard', value: n(s?.enRetard), tone: 'amber', sub: '> 30 jours' },
    ],
    actions: [
      { to: '/statistiques', label: 'Statistiques', icon: BarChart3, perms: ['view_stats'] },
      { to: '/rapports', label: 'Rapports', icon: FileBarChart2, perms: ['view_stats', 'consolidate_reports', 'export_data'] },
      { to: '/documents/upload', label: 'Déposer un document', icon: Upload, perms: ['upload_document'] },
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
 * ress (comptes courriers/documents), ordres (tableau de bord + liste des
 * pièces de déplacement, Chef BAAF uniquement).
 */
export function configRole(role, data) {
  const cfg = CONFIG[role];
  if (!cfg) return null;
  return { ...cfg, kpis: cfg.kpis(data) };
}

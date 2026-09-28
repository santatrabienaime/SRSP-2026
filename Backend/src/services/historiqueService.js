import * as historiqueModel from '../models/historiqueModel.js';
import * as scopeService from './scopeService.js';
import { LIBELLES_ACTIONS } from '../utils/libellesActions.js';
import { httpError } from '../utils/httpError.js';

/**
 * Lecture du journal des actions.
 *
 * Deux responsabilités distinctes :
 *   - traduire les codes techniques en libellés lisibles (l'agent, le rôle) ;
 *   - vérifier que l'utilisateur a le droit de lire le journal demandé.
 */

/** Codes de rôle → libellé métier, en français. */
const LIBELLES_ROLE = {
  ADMIN: 'Administrateur',
  CHEF_SERVICE: 'Chef de Service',
  CHEF_BAAF: 'Chef de BAAF',
  COORDINATRICE: 'Coordinatrice',
  SECRETAIRE: 'Secrétaire',
  CHEF_DIVISION_VISA: 'Chef Division Visa',
  VERIFICATEUR_VISA: 'Vérificateur Visa',
  CHEF_DIVISION_SOLDE: 'Chef Division Solde',
  VERIFICATEUR_SOLDE: 'Vérificateur Solde',
  CHEF_DIVISION_PENSION: 'Chef Division Pension',
  LIQUIDATEUR_PENSION: 'Liquidateur Pension',
  CHEF_DIVISION_SECOURS: 'Chef Division Secours',
  CHARGE_SECOURS: 'Chargé de Secours',
};

/**
 * Normalise une ligne d'historique pour l'affichage.
 *
 * L'agent est désigné par son nom et son prénom, pas par son identifiant de
 * connexion : « chef.visa » dit quel compte s'est connecté, pas qui a agi.
 * Lorsque l'agent est inconnu, on l'affiche tel quel plutôt que de masquer
 * l'information : une trace incomplète se voit, une trace maquillée ne se voit
 * jamais.
 */
function presenter(ligne) {
  /* L'ordre « nom prénom » est celui de toute l'application (liste des dossiers,
     fiche dossier, archives) : le journal ne doit pas introduire un second
     format pour la même personne. */
  const nomComplet = [ligne.agent_nom, ligne.agent_prenom].filter(Boolean).join(' ').trim();

  let agent;
  if (nomComplet) {
    agent = { identite: nomComplet, username: ligne.username, systeme: false };
  } else if (ligne.username) {
    agent = { identite: ligne.username, username: ligne.username, systeme: false };
  } else {
    // Aucun auteur : c'est le cas d'un échec de connexion. On l'assume et on
    // l'explique, plutôt que d'afficher un champ vide qui passerait pour un
    // oubli de saisie.
    agent = {
      identite: 'Système',
      username: null,
      systeme: true,
      raison: historiqueModel.ACTIONS_SANS_AUTEUR[ligne.action]
        || 'Aucun compte associé à cet événement.',
    };
  }

  /* La table `roles` ne porte qu'un code technique (CHEF_DIVISION_VISA) et une
     description rédigée en phrases longues (« supervision, validation et
     signature finale »), inexploitables dans une colonne « Rôle ». La
     correspondance ci-dessus est donc la source du libellé court ; la
     description ne sert que de repli pour un rôle nouveau, et le code brut en
     dernier recours. */
  const role = ligne.role_code
    ? {
        code: ligne.role_code,
        libelle: LIBELLES_ROLE[ligne.role_code] || ligne.role_description || ligne.role_code,
      }
    : agent.systeme
      ? { code: null, libelle: 'Automatique' }
      : null;

  return {
    id: ligne.id,
    action: ligne.action,
    action_libelle: LIBELLES_ACTIONS[ligne.action] || ligne.action,
    details: ligne.details,
    ip_address: ligne.ip_address,
    date_action: ligne.date_action,
    dossier_id: ligne.dossier_id,
    dossier_numero: ligne.dossier_numero,
    agent,
    role,
  };
}

/** Durée entre deux horodatages, en phrasing lisible. */
function duree(entree, sortie) {
  if (!entree || !sortie) return null;
  const ms = new Date(sortie).getTime() - new Date(entree).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  const min = Math.floor(ms / 60000);
  const j = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  const morceaux = [];
  if (j) morceaux.push(`${j} jour${j > 1 ? 's' : ''}`);
  if (h) morceaux.push(`${h} heure${h > 1 ? 's' : ''}`);
  if (m || !morceaux.length) morceaux.push(`${m} minute${m > 1 ? 's' : ''}`);
  return morceaux.join(', ');
}

/**
 * Journal filtré, et cloak : on ne laisse pas fuiter le journal d'un dossier
 * hors périmètre, seulement parce que l'appelant en connaît l'identifiant.
 */
export async function getHistorique(userId, filtres = {}) {
  // Un journal global n'a de sens que pour qui peut voir tous les dossiers.
  // Sinon, on restreint au périmètre plutôt que de tout refuser : un chef de
  // division doit pouvoir consulter la traçabilité de SES dossiers.
  if (filtres.dossier_id) {
    if (!await scopeService.accesDossier(userId, filtres.dossier_id)) {
      throw httpError(403, "Accès refusé : ce dossier n'appartient pas à votre périmètre.");
    }
  } else {
    const scope = await scopeService.getScope(userId);
    /* `view_all_dossiers` ne convient pas ici : cette permission dit qu'on voit
       tous les dossiers, pas les actions de tous les agents. La secrétaire la
       possède, et elle n'a pas à lire les connexions et signatures des autres.
       `view_journal` est le droit propre au journal global. */
    const pilote = scope.permissions.includes('view_journal')
      || scope.permissions.includes('view_audit')
      || scope.divisionScoped;
    if (!pilote) {
      throw httpError(403, "Accès refusé : le journal global n'est pas consultable par votre rôle.");
    }

    /* Un chef de division a le droit de consulter le journal, mais celui de SA
       division seulement. Sans cette restriction, il lirait les connexions et
       validations des trois autres divisions : le journal leaking par
       l'absence de filtre serait pire que son interdiction. */
    if (scope.divisionScoped && scope.divisionId) {
      filtres = { ...filtres, division_id: scope.divisionId };
    }
  }

  const { lignes, total, tronque } = await historiqueModel.findAll(filtres);
  const actions = lignes.map(presenter);

  // Durée totale de traitement, du premier au dernier acte du dossier.
  let dureeTraitement = null;
  if (filtres.dossier_id && actions.length > 1) {
    const dates = actions.map((a) => new Date(a.date_action).getTime()).filter(Number.isFinite);
    if (dates.length > 1) {
      dureeTraitement = duree(new Date(Math.min(...dates)), new Date(Math.max(...dates)));
    }
  }

  return { actions, total, tronque, duree_traitement: dureeTraitement };
}

/** Types d'actions réellement présents au journal, pour les listes de filtre. */
export async function getActions(userId) {
  const scope = await scopeService.getScope(userId);
  const pilote = scope.permissions.includes('view_journal')
    || scope.permissions.includes('view_audit')
    || scope.divisionScoped;
  if (!pilote) {
    throw httpError(403, "Accès refusé : le journal global n'est pas consultable par votre rôle.");
  }
  return historiqueModel.findActions();
}

export async function log(data) {
  return historiqueModel.log(data);
}

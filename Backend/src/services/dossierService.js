import * as dossierModel from '../models/dossierModel.js';
import * as depouillementModel from '../models/depouillementModel.js';
import { createArchive } from '../models/archiveModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import * as suppressionModel from '../models/suppressionModel.js';
import * as notificationModel from '../models/notificationModel.js';
import db from '../config/db.js';
import * as workflowService from './workflowService.js';
import * as tracabiliteService from './tracabiliteService.js';
import * as routageService from './routageService.js';
import * as affectationAutoService from './affectationAutoService.js';
import {
  STATUTS, STATUTS_PROTEGES, ETATS_PIECE_LABELS,
} from '../utils/constants.js';
import { httpError } from '../utils/httpError.js';
import { normaliserMatricule, matriculeValide, matriculeCaracteresValides } from '../validators/dossierValidators.js';

const { BROUILLON, ENREGISTRE, ORIENTE, AFFECTE, EN_TRAITEMENT, EN_ATTENTE_COMPLEMENT,
        SOUMIS_A_VERIFICATION, CORRECTION_DEMANDEE, VALIDE, SIGNE, CLOTURE, ARCHIVE } = STATUTS;

export async function getAllDossiers(filters) {
  return dossierModel.findDossiers(filters);
}

export async function getDossierById(id) {
  return dossierModel.findDossierById(id);
}

/**
 * Recherche un matricule déjà connu, pour pré-remplir le formulaire.
 *
 * Le document prévoit ce mécanisme : la secrétaire saisit le matricule, et si
 * la personne est déjà connue, ses coordonnées sont proposées. C'est une aide à
 * la saisie, PAS un blocage : un client revient légitimement, avec un dossier
 * de visa puis un de solde, puis une pension.
 *
 * La comparaison se fait sur le matricule compacté, car il est saisi tantôt
 * avec espaces, tantôt sans. Une personne qui resaisit « 222 222 222 » doit être
 * reconnue aussi bien que « 222222222 ».
 */
export async function rechercherParMatricule(matricule) {
  const compact = normaliserMatricule(matricule);
  if (!compact) return { trouve: false, dossiers: [] };

  const dossiers = await dossierModel.findDossiersParMatricule(compact);
  const [plusRecent] = dossiers;

  return {
    trouve: dossiers.length > 0,
    // Les dossiers sont classés du plus récent au plus ancien : c'est le
    // dernier qui porte les coordonnées les plus à jour.
    identite: plusRecent
      ? {
          nom: plusRecent.demandeur_nom || plusRecent.demandeur,
          prenom: plusRecent.demandeur_prenom || '',
          telephone: plusRecent.demandeur_tel || '',
          email: plusRecent.demandeur_email || '',
          adresse: plusRecent.demandeur_adresse || '',
        }
      : null,
    dossiers: dossiers.map((d) => ({
      id: d.id,
      numero: d.numero,
      type: d.type_libelle,
      statut: d.statut_libelle,
      date_reception: d.date_reception,
      actif: !['CLOTURE', 'ARCHIVE'].includes(d.statut_code),
    })),
  };
}

/**
 * Complète `demandeur` à partir des colonnes séparées.
 *
 * La table porte les deux depuis toujours : `demandeur` pour l'affichage et les
 * exports, les colonnes détaillées pour le filtrage. Si elles divergeaient, une
 * recherche sur le nom ne retrouverait pas le dossier listé sous un autre
 * intitulé. On les synchronise donc à l'écriture, plutôt que de demander à
 * chaque lecteur de deviner laquelle fait foi.
 */
function harmoniserDemandeur(data) {
  const nom = (data.demandeur_nom || '').trim();
  const prenom = (data.demandeur_prenom || '').trim();
  if (!nom && !prenom) return data;

  // Ni l'un ni l'autre : on garde la saisie initiale.
  if (!nom || !prenom) return { ...data, demandeur: (nom || prenom).slice(0, 150) };

  return { ...data, demandeur: `${nom} ${prenom}`.trim().slice(0, 150) };
}

/** Message unique de la règle du matricule, création et modification comprises. */
const MESSAGE_MATRICULE =
  'Le matricule doit comporter 2 à 10 caractères (chiffres et lettres).';

/**
 * Contrôle du matricule avant enregistrement.
 *
 * Règle de service : 2 à 10 caractères alphanumériques. Elle souffre UNE
 * exception — un numéro déjà enregistré dans les dossiers du service, saisi
 * avant que la règle n'existe. Le refuser aurait deux conséquences fâcheuses :
 * un dossier existant deviendrait INCORRIGIBLE (aucun champ, même sans rapport
 * avec le matricule, ne pourrait plus être enregistré) et un demandeur déjà
 * connu ne pourrait plus être enregistré à nouveau. Un numéro inédit, lui, doit
 * respecter la règle.
 */
async function verifierMatricule(matricule) {
  if (matricule === undefined || matricule === null) return;
  if (matriculeValide(matricule)) return;
  if (!matriculeCaracteresValides(matricule)) throw httpError(422, MESSAGE_MATRICULE);

  const compact = normaliserMatricule(matricule);
  if (!compact) return;
  const connus = await dossierModel.findDossiersParMatricule(compact);
  if (!connus.length) throw httpError(422, MESSAGE_MATRICULE);
}

export async function createDossier(data, userId) {
  // Routage automatique : la division découle du type de dossier.
  // Si l'appelant fournit une division, elle doit correspondre au type.
  const division = await routageService.divisionPourType(data.type_id);
  if (!division) {
    throw httpError(
      422,
      "Aucune division n'est rattachée à ce type de dossier. Vérifiez le référentiel."
    );
  }
  if (data.division_id && Number(data.division_id) !== division.id) {
    throw httpError(
      422,
      `Le type de dossier choisi correspond à la division ${division.nom} : ` +
      "la division n'est pas modifiable à la création."
    );
  }

  const [type] = await db.query('SELECT code FROM types_dossiers WHERE id = ?', [data.type_id]);
  const estVisa = String(type?.code).toUpperCase() === 'VISA';

  /* Données VISA : la fiche doit être complète dès la réception. Les laisser
     facultatives à la création reporterait la saisie au moment de la
     validation, c'est-à-dire à un moment où le demandeur n'est plus là.

     Un brouillon fait exception : c'est précisément le cas d'usage du
     brouillon — une fiche encore incomplète, mise de côté pour être
     terminée. Le contrôle s'applique au moment de la publication. */
  if (estVisa && !data.brouillon) {
    const manquants = champsVisaReceptionManquants(data);
    if (manquants.length) {
      throw httpError(422, `Dossier VISA : renseignez ${manquants.join(', ')}.`);
    }
  }

  if (data.sous_type_id) {
    const [sousType] = await db.query(
      'SELECT id, libelle FROM sous_types_dossiers WHERE id = ? AND type_dossier_id = ? AND actif = 1',
      [data.sous_type_id, data.type_id]
    );
    if (!sousType) throw httpError(422, 'Sous-type de dossier inconnu ou inactif.');
    // Le libellé du sous-type est le type d'acte : une seule source de vérité.
    if (!String(data.type_acte || '').trim()) data.type_acte = sousType.libelle;
  } else if (!data.brouillon) {
    /* Un type qui distingue des opérations — mandatement, liquidation,
       opposition — exige que l'on dise laquelle. Le sous-type porte le
       libellé affiché et détermine les pièces requises : sans lui, la fiche
       ne dit pas de quoi elle parle.

       Un brouillon fait exception : c'est le cas d'usage du brouillon, une
       fiche encore incomplète mise de côté pour être terminée. */
    const [types] = await db.query(
      'SELECT COUNT(*) AS n FROM sous_types_dossiers WHERE type_dossier_id = ? AND actif = 1',
      [data.type_id]
    );
    if (Number(types?.n || 0) > 0) {
      throw httpError(
        422,
        'Choisissez le type d’opération : ce dossier en distingue plusieurs.'
      );
    }
  }

  // Avant toute écriture : un matricule refusé ne doit pas consommer de numéro.
  await verifierMatricule(data.matricule);

  const dossier = await dossierModel.createDossier({
    ...harmoniserDemandeur(data),
    division_id: division.id,
    date_heure_reception: data.date_heure_reception || new Date(),
    annee_reference: data.annee_reference
      || (data.date_reception ? new Date(data.date_reception).getFullYear() : new Date().getFullYear()),
    created_by: userId,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'CREATION_DOSSIER',
    dossier_id: dossier.id,
    details: `Création du dossier ${dossier.numero}`,
  });

  /* Brouillon.
   *
   * Le cahier des fonctionnalités demande de permettre « l'enregistrement en
   * brouillon lorsque le processus le permet ». Un brouillon n'est pas dans
   * le circuit : il ne déclenche aucune notification, n'est orienté vers
   * personne, et n'apparaît que chez son auteur.
   *
   * Le dossier porte un numéro dès sa création — la référence interne ne
   * doit jamais être réutilisée, un brouillon abandonné ne rend donc pas son
   * numéro disponible. */
  if (data.brouillon) {
    await dossierModel.setStatutBrouillon(dossier.id);
    await historiqueModel.log({
      user_id: userId,
      action: 'ENREGISTREMENT_BROUILLON',
      dossier_id: dossier.id,
      details: `Dossier ${dossier.numero} enregistré en brouillon.`,
    });
    return {
      ...dossier,
      brouillon: true,
      division_nom: division.nom,
      division_code: division.code,
    };
  }

  // Réception → enregistrement automatique à la création
  try {
    await workflowService.transition(dossier.id, ENREGISTRE, userId, 'Enregistrement lors de la réception.');
  } catch (e) {
    // Le passage RECU → ENREGISTRE est toujours autorisé ; silence par sécurité.
  }

  await historiqueModel.log({
    user_id: userId,
    action: 'ENREGISTREMENT',
    dossier_id: dossier.id,
    details: `Dossier ${dossier.numero} enregistré.`,
  });

  // Orientation automatique vers la division du type, puis affectation
  // automatique à l'agent de traitement de cette division.
  let agentAutomatic = null;
  try {
    await workflowService.transition(
      dossier.id,
      ORIENTE,
      userId,
      `Orientation automatique vers ${division.nom} (routage par type).`
    );
    await historiqueModel.log({
      user_id: userId,
      action: 'ORIENTATION',
      dossier_id: dossier.id,
      nouvelle_valeur: division.nom,
      details: 'Routage automatique : la division découle du type de dossier.',
    });

    agentAutomatic = await affecterAutomatiquement(dossier.id, division.id, userId);
  } catch (e) {
    // Si l'orientation échoue, le dossier reste enregistré et sera orientable
    // manuellement : on ne perd pas la création.
    console.warn('Orientation automatique impossible :', e.message);
  }

  // La personne à l'origine est prévenue personnellement.
  await notificationModel.notifyUser(userId, {
    dossier_id: dossier.id,
    action: 'DOSSIER_ENREGISTRE',
    type: 'INFO',
    message: agentAutomatic
      ? `Nouveau dossier ${dossier.numero} enregistré, orienté vers ${division.nom} et affecté à ${agentAutomatic.nom} ${agentAutomatic.prenom || ''}`.trim() + '.'
      : `Nouveau dossier ${dossier.numero} enregistré et orienté vers ${division.nom}.`,
    lien: `/dossiers/${dossier.id}`,
  });

  return {
    ...dossier,
    division_nom: division.nom,
    division_code: division.code,
    agent_id: agentAutomatic?.id || null,
    agent_nom: agentAutomatic?.nom || null,
    agent_prenom: agentAutomatic?.prenom || null,
  };
}

/**
 * Publie un brouillon : il entre dans le circuit.
 *
 * La publication fait exactement ce que fait une création ordinaire, à
 * partir du brouillon : enregistrement, orientation vers la division,
 * affectation à un agent, notification. Un brouillon est donc un dossier
 * retardé, pas un dossier différent — il reprend le même chemin.
 */
export async function publier(id, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== BROUILLON) {
    throw httpError(409, `Ce dossier n—"est pas un brouillon (statut ${current}).`);
  }

  const dossier = await dossierModel.findDossierById(id);
  if (!dossier) throw httpError(404, 'Dossier introuvable.');
  if (Number(dossier.created_by) !== Number(userId)) {
    throw httpError(403, 'Seul l’auteur du brouillon peut le publier.');
  }

  /* Un dossier VISA ne peut entrer dans le circuit avec une fiche incomplète :
     c'est le contrôle qui s'applique à la création, appliqué ici au moment
     de la publication. */
  if (dossier.type_code === 'VISA') {
    const manquants = champsVisaReceptionManquants(dossier);
    if (manquants.length) {
      throw httpError(
        422,
        `Dossier VISA incomplet : renseignez ${manquants.join(', ')} avant de publier.`
      );
    }
  }

  /* De même, le type d'opération : un dossier publié doit dire de quelle
     opération il s'agit. */
  if (!dossier.sous_type_id) {
    const [types] = await db.query(
      'SELECT COUNT(*) AS n FROM sous_types_dossiers WHERE type_dossier_id = ? AND actif = 1',
      [dossier.type_id]
    );
    if (Number(types?.n || 0) > 0) {
      throw httpError(
        422,
        'Choisissez le type d’opération avant de publier : ce dossier en distingue plusieurs.'
      );
    }
  }

  await workflowService.transition(
    id,
    ENREGISTRE,
    userId,
    'Publication du brouillon dans le circuit.'
  );
  await historiqueModel.log({
    user_id: userId,
    action: 'PUBLICATION_BROUILLON',
    dossier_id: id,
    details: `Publication du brouillon ${dossier.numero}.`,
  });

  const division = await dossierModel.findDivisionOfDossier(id);
  let agentAutomatic = null;
  try {
    await workflowService.transition(
      id,
      ORIENTE,
      userId,
      `Orientation automatique vers la division (routage par type).`
    );
    agentAutomatic = await affecterAutomatiquement(id, division.division_id, userId);
  } catch (e) {
    console.warn('Orientation automatique impossible :', e.message);
  }

  await notificationModel.notifyUser(userId, {
    dossier_id: id,
    action: 'DOSSIER_PUBLIE',
    type: 'INFO',
    message: `Le brouillon ${dossier.numero} a été publié et entre dans le circuit.`,
    lien: `/dossiers/${id}`,
  });

  return {
    message: 'Brouillon publié : le dossier entre dans le circuit.',
    agent_nom: agentAutomatic?.nom || null,
  };
}

/**
 * Champs VISA obligatoires pour que la fiche puisse entrer dans le circuit.
 *
 * La même liste sert à la création et à la publication d'un brouillon : un
 * dossier ne peut pas entrer dans le circuit avec une fiche incomplète.
 *
 * Elle est volontairement plus courte que `champsVisaManquants` (le contrôle
 * de la validation) : à la réception, la référence VISA, la date et l'heure
 * et le vérificateur sont renseignés par le service ou par le formulaire ;
 * l'origine, le comptable et le type d'acte, eux, doivent venir de l'agent.
 */
function champsVisaReceptionManquants(data) {
  const manquants = [];
  if (!String(data.origine_presentateur || '').trim()) manquants.push('origine / présentateur');
  if (!String(data.comptable_presentateur || '').trim()) manquants.push('comptable présentateur');
  if (!String(data.type_acte || '').trim() && !data.sous_type_id) manquants.push("type d'acte");
  return manquants;
}

/**
 * Affecte un dossier orienté à l'agent de traitement de sa division.
 *
 * Appelée après chaque orientation. Retourne l'agent retenu, ou null si la
 * division n'a personne d'éligible — le dossier reste alors ORIENTE, visible
 * dans la file d'attente, et le chef de division l'affecte lui-même. Mieux vaut
 * une exception signalée qu'un dossier confié à personne.
 */
export async function affecterAutomatiquement(dossierId, divisionId, userId) {
  const agent = await affectationAutoService.choisirAgent(divisionId);
  if (!agent) {
    await historiqueModel.log({
      user_id: userId,
      action: 'ORIENTATION',
      dossier_id: dossierId,
      details: "Aucun agent de traitement actif dans cette division : le dossier reste en attente d'affectation.",
    });
    return null;
  }

  const identite = `${agent.nom} ${agent.prenom || ''}`.trim();
  const avant = await dossierModel.findDivisionOfDossier(dossierId);
  await dossierModel.setAgentResponsable(dossierId, agent.id);
  await workflowService.transition(
    dossierId,
    AFFECTE,
    userId,
    `Affectation automatique à ${identite} (${agent.role_code}).`
  );
  // tracabiliteService porte déjà l'écriture dans `affectations` et, le cas
  // échéant, la trace de transfert : on s'y branche plutôt que de dupliquer.
  await tracabiliteService.tracerAffectation(dossierId, {
    division_id: divisionId,
    agent_id: agent.id,
    ancien_agent_id: avant?.agent_responsable_id || null,
    motif: 'Affectation automatique à la création du dossier.',
    userId,
  });
  await historiqueModel.log({
    user_id: userId,
    action: 'AFFECTATION',
    dossier_id: dossierId,
    nouvelle_valeur: `${identite} (${agent.role_code})`,
    // Le nom de l'agent est dans le détail, et pas seulement dans la valeur
    // nouvelle : l'historique doit être lisible tel quel dans la fiche, sans
    // que l'agent ait à décoder une valeur technique.
    details: `Affectation automatique à ${identite} — agent de traitement de la division, le moins chargé.`,
  });

  /* L'agent est prévenu par la transition AFFECTE ci-dessus : la notification
     part de workflowService, à un seul endroit, pour toute affectation —
     automatique ou manuelle. En ajouter une seconde ici faisait recevoir deux
     avertissements pour le même acte. */

  return { id: agent.id, nom: agent.nom, prenom: agent.prenom, role: agent.role_code };
}

export async function updateDossier(id, data, userId) {
  const currentStatut = await workflowService.getCurrentStatus(id);
  if (STATUTS_PROTEGES.includes(currentStatut)) {
    throw httpError(409, 'Ce dossier est clôturé ou archivé : modification interdite.');
  }

  await verifierMatricule(data.matricule);

  // Sous-type (type d'acte) : même règle qu'à la création, y compris la
  // dérivation du libellé quand seul l'identifiant est transmis.
  if (data.sous_type_id) {
    const courant = await dossierModel.findDossierById(id);
    const typeId = data.type_id ?? courant?.type_id;
    const [sousType] = await db.query(
      'SELECT id, libelle FROM sous_types_dossiers WHERE id = ? AND type_dossier_id = ? AND actif = 1',
      [data.sous_type_id, typeId]
    );
    if (!sousType) throw httpError(422, 'Sous-type de dossier inconnu ou inactif.');
    if (!String(data.type_acte || '').trim()) data.type_acte = sousType.libelle;
  }

  // Règle 2 du routage automatique : la division découle du type et n'est pas
  // modifiable. Seul un Chef de Service ou un Administrateur peut le faire à
  // titre exceptionnel, et seulement avec un motif obligatoire (règle 3).
  if (data.division_id !== undefined) {
    const courant = await dossierModel.findDossierById(id);
    const nouvelleDivision = Number(data.division_id);

    if (courant && nouvelleDivision !== courant.division_id) {
      // La division cible doit exister et être active : sinon on renvoie un
      // message clair au lieu de laisser remonter une erreur de contrainte.
      const cible = await db.query(
        'SELECT id, nom FROM divisions WHERE id = ? AND actif = 1 LIMIT 1',
        [nouvelleDivision]
      );
      if (!cible[0]) {
        throw httpError(422, 'Division inconnue ou inactive.');
      }
      if (!await peutDeroguer(userId)) {
        throw httpError(
          403,
          'La division est déterminée par le type de dossier et ne peut pas être modifiée. ' +
          "Seul le Chef de Service ou l'administrateur peut le faire à titre exceptionnel."
        );
      }
      if (!data.motif_changement_division || !String(data.motif_changement_division).trim()) {
        throw httpError(
          422,
          "Un motif est obligatoire pour changer la division d'un dossier."
        );
      }
      await historiqueModel.log({
        user_id: userId,
        action: 'CHANGEMENT_DIVISION',
        dossier_id: id,
        ancienne_valeur: courant.division_nom,
        nouvelle_valeur: cible[0].nom,
        details: `Dérogation : ${data.motif_changement_division}`,
      });
    }
  }

  const dossier = await dossierModel.updateDossier(id, data);
  await historiqueModel.log({
    user_id: userId,
    action: 'MODIFICATION_DOSSIER',
    dossier_id: id,
    details: `Modification du dossier ${dossier.numero}`,
  });
  return dossier;
}

/** Rôles autorisés à changer la division d'un dossier (règle 3). */
const ROLES_DEROGATION = ['ADMIN', 'CHEF_SERVICE'];

async function peutDeroguer(userId) {
  const rows = await db.query(
    `SELECT r.nom FROM roles r
     JOIN users u ON u.role_id = r.id
     WHERE u.id = ?`,
    [userId]
  );
  return rows.some((r) => ROLES_DEROGATION.includes(r.nom));
}

/** Le compte possède-t-il cette permission ? Les permissions viennent du rôle. */
async function aPermission(userId, permission) {
  const rows = await db.query(
    `SELECT 1 FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     JOIN users u ON u.role_id = rp.role_id
     WHERE u.id = ? AND p.nom = ? LIMIT 1`,
    [userId, permission]
  );
  return rows.length > 0;
}

async function roleDe(userId) {
  const [row] = await db.query(
    `SELECT r.nom FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
    [userId]
  );
  return row?.nom || null;
}

/**
 * Champs qui doivent être renseignés pour qu'un dossier VISA puisse être
 * validé. Ils sont contrôlés au moment de la décision, pas seulement à la
 * saisie : un dossier créé avant la mise en conformité, ou modifié ensuite,
 * doit être bloqué comme les autres.
 */
const CHAMPS_VISA_OBLIGATOIRES = [
  ['reference_visa', 'référence VISA'],
  ['date_heure_reception', 'date et heure de réception'],
  ['origine_presentateur', 'origine / présentateur'],
  ['comptable_presentateur', 'comptable présentateur'],
  ['objet', 'objet'],
  ['type_acte', "type d'acte"],
  ['annee_reference', 'année de référence'],
  ['verificateur_id', 'vérificateur'],
];

function champsVisaManquants(dossier) {
  if (dossier.type_code !== 'VISA') return [];
  return CHAMPS_VISA_OBLIGATOIRES
    .filter(([colonne]) => {
      const valeur = dossier[colonne];
      return valeur === null || valeur === undefined || String(valeur).trim() === '';
    })
    .map(([, libelle]) => libelle);
}

/** Libellés des pièces obligatoires non satisfaites pour une phase. */
async function piecesObligatoiresManquantes(dossierId, phase) {
  const pieces = await depouillementModel.piecesObligatoiresNonSatisfaites(dossierId, phase);
  return pieces.map((p) => `${p.libelle} (${ETATS_PIECE_LABELS[p.etat] || p.etat})`);
}

function messageIncompletude(champs, pieces) {
  const parties = [];
  if (champs.length) parties.push(`champs manquants : ${champs.join(', ')}`);
  if (pieces.length) parties.push(`pièces obligatoires non satisfaites : ${pieces.join(', ')}`);
  return `Validation bloquée : le dossier est incomplet (${parties.join(' ; ')}).`;
}

/**
 * Contrôle de complétude avant validation.
 *
 * La règle est bloquante. Une dérogation est possible, mais seulement pour un
 * titulaire de `deroger_validation` (chef de service), avec un motif écrit :
 * l'exception est enregistrée sur le dossier et dans l'historique. Une
 * validation « au silence » ne doit pas pouvoir contourner les pièces requises.
 */
async function controlerCompletudeValidation(id, { motifException, userId }) {
  const dossier = await dossierModel.findDossierById(id);
  if (!dossier) throw httpError(404, 'Dossier introuvable.');

  const [champs, pieces] = await Promise.all([
    Promise.resolve(champsVisaManquants(dossier)),
    piecesObligatoiresManquantes(id, 'DEPOUILLEMENT'),
  ]);

  if (!champs.length && !pieces.length) {
    return { derogation: false, champs, pieces };
  }

  const motif = String(motifException || '').trim();
  if (!motif) {
    throw httpError(
      422,
      `${messageIncompletude(champs, pieces)} Renseignez un motif de dérogation si un chef de service autorisé décide de passer outre.`
    );
  }
  if (!(await aPermission(userId, 'deroger_validation'))) {
    throw httpError(
      403,
      "Vous ne pouvez pas déroger au contrôle de complétude : seul un chef de service autorisé peut le faire."
    );
  }
  if (motif.length < 5) {
    throw httpError(422, 'Le motif de dérogation doit être explicite (5 caractères minimum).');
  }

  await dossierModel.setExceptionValidation(id, { motif, userId });
  await historiqueModel.log({
    user_id: userId,
    action: 'DEROGATION_VALIDATION',
    dossier_id: id,
    details:
      `Validation malgré un dossier incomplet — motif : ${motif}. ` +
      `Éléments manquants : ${[...champs, ...pieces].join(', ')}.`,
  });

  return { derogation: true, champs, pieces, motif };
}

/**
 * Contrôles d'archivage propres au VISA.
 *
 * Un dossier VISA ne s'archive pas sur la seule foi du statut : il faut une
 * signature enregistrée (date + signataire) et les pièces d'archivage requises
 * (état de signature, PV de réception, etc.). Le vérificateur VISA peut
 * archiver lui-même un dossier signé — c'est son rôle — mais pas un dossier
 * qu'il n'a pas contrôlé.
 */
async function controlerArchivageVisa(dossier, userId) {
  if (dossier.type_code !== 'VISA') return;

  if (!dossier.date_signature || !dossier.signataire_id) {
    throw httpError(
      409,
      "Archivage impossible : la signature du Chef de Service n'est pas enregistrée sur ce dossier."
    );
  }

  const manquantes = await piecesObligatoiresManquantes(dossier.id, 'ARCHIVAGE');
  if (manquantes.length) {
    throw httpError(
      409,
      `Archivage impossible : pièces obligatoires d'archivage non satisfaites : ${manquantes.join(', ')}.`
    );
  }

  const role = await roleDe(userId);
  if (!['CHEF_SERVICE', 'VERIFICATEUR_VISA'].includes(role)) {
    throw httpError(
      403,
      "Seul le vérificateur VISA ou le chef de service peut archiver un dossier VISA."
    );
  }
}

/** Orientation vers une division (ENREGISTRE → ORIENTE). */
export async function orienter(id, { division_id }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== ENREGISTRE && current !== ORIENTE) {
    throw httpError(409, `Orientation impossible depuis le statut ${current}.`);
  }
  await dossierModel.setDivision(id, division_id);
  if (current === ENREGISTRE) {
    await workflowService.transition(id, ORIENTE, userId, `Orientation vers la division ${division_id}.`);
  }
  await historiqueModel.log({
    user_id: userId,
    action: 'ORIENTATION',
    dossier_id: id,
    details: `Dossier orienté vers la division ${division_id}.`,
  });

  // Un dossier orienté manuellement l'est aussi automatiquement, sinon la
  // secrétaire devrait en plus choisir l'agent : c'est précisément la double
  // saisie que l'affectation automatique doit supprimer.
  await affecterAutomatiquement(id, division_id, userId);
}

/** Affectation à un agent (ORIENTE → AFFECTE). */
export async function affecter(id, { division_id, agent_id, motif }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (![ENREGISTRE, ORIENTE, AFFECTE, CORRECTION_DEMANDEE, EN_ATTENTE_COMPLEMENT].includes(current)) {
    throw httpError(409, `Affectation impossible depuis le statut ${current}.`);
  }

  const dossier = await dossierModel.findDossierById(id);
  if (!dossier) throw httpError(404, 'Dossier introuvable.');

  const [agent] = await db.query(
    `SELECT a.id, a.nom, a.prenom, a.division_id, r.nom AS role_code
     FROM agents a
     LEFT JOIN users u ON u.id = a.user_id
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE a.id = ? AND a.actif = 1`,
    [agent_id]
  );
  if (!agent) throw httpError(422, 'Agent inconnu ou inactif.');

  let divisionCible = dossier.division_id;
  if (division_id) {
    const [division] = await db.query(
      'SELECT id FROM divisions WHERE id = ? AND actif = 1 LIMIT 1',
      [division_id]
    );
    if (!division) throw httpError(422, 'Division inconnue ou inactive.');
    divisionCible = division.id;
  }
  if (agent.division_id && Number(agent.division_id) !== Number(divisionCible)) {
    throw httpError(
      422,
      `L'agent ${agent.nom} appartient à une autre division : une réaffectation ne peut pas changer la division du dossier.`
    );
  }

  const avant = await dossierModel.findDivisionOfDossier(id);
  const ancienAgentId = avant?.agent_responsable_id || null;
  const reassignation = ancienAgentId && Number(ancienAgentId) !== Number(agent.id);
  const motifPropre = String(motif || '').trim();
  if (reassignation && !motifPropre) {
    throw httpError(
      422,
      "Un motif est obligatoire pour réaffecter un dossier à un autre agent."
    );
  }

  if (division_id) await dossierModel.setDivision(id, divisionCible);
  await dossierModel.setAgentResponsable(id, agent.id);
  if (current !== AFFECTE) {
    if (current === ENREGISTRE) {
      await workflowService.transition(id, ORIENTE, userId, `Orientation vers la division ${divisionCible}.`);
    }
    await workflowService.transition(
      id,
      AFFECTE,
      userId,
      `Affectation à ${agent.nom} ${agent.prenom || ''}`.trim() + (motifPropre ? ` — ${motifPropre}` : '.')
    );
  }

  // Traçabilité fine : affectation (+ transfert si le dossier change d'agent).
  await tracabiliteService.tracerAffectation(id, {
    division_id: divisionCible,
    agent_id: agent.id,
    ancien_agent_id: ancienAgentId,
    motif: motifPropre || 'Affectation au responsable de traitement.',
    userId,
  });
  await historiqueModel.log({
    user_id: userId,
    action: 'AFFECTATION',
    dossier_id: id,
    nouvelle_valeur: `${agent.nom} ${agent.prenom || ''}`.trim(),
    details: reassignation
      ? `Réaffectation motivée : ${motifPropre}`
      : 'Affectation à l—"agent de traitement.',
  });
}

/**
 * Demande de complément (EN_TRAITEMENT | SOUMIS_A_VERIFICATION →
 * EN_ATTENTE_COMPLEMENT). Le motif est obligatoire : c'est lui que le
 * secrétariat transmettra au demandeur.
 */
export async function demanderComplement(id, { motif }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (![EN_TRAITEMENT, SOUMIS_A_VERIFICATION].includes(current)) {
    throw httpError(409, `Demande de complément impossible depuis le statut ${current}.`);
  }
  const motifPropre = String(motif || '').trim();
  if (!motifPropre) {
    throw httpError(422, 'Le motif du complément est obligatoire.');
  }

  await dossierModel.setComplement(id, motifPropre);
  await workflowService.transition(
    id,
    EN_ATTENTE_COMPLEMENT,
    userId,
    `Complément demandé : ${motifPropre}`
  );
  await tracabiliteService.tracerFinTraitement(id);
  await historiqueModel.log({
    user_id: userId,
    action: 'DEMANDE_COMPLEMENT',
    dossier_id: id,
    details: motifPropre,
  });
}

/** Prise en charge / traitement (AFFECTE | CORRECTION_DEMANDEE | COMPLEMENT → EN_TRAITEMENT). */
export async function traiter(id, { observation } = {}, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current === EN_TRAITEMENT) {
    await historiqueModel.log({
      user_id: userId, action: 'TRAITEMENT', dossier_id: id, details: observation,
    });
    return;
  }
  if (![AFFECTE, CORRECTION_DEMANDEE, EN_ATTENTE_COMPLEMENT].includes(current)) {
    throw httpError(409, `Traitement impossible depuis le statut ${current}.`);
  }

  const complement = current === EN_ATTENTE_COMPLEMENT;
  await workflowService.transition(
    id,
    EN_TRAITEMENT,
    userId,
    complement
      ? `Complément reçu — reprise du traitement.${observation ? ` ${observation}` : ''}`
      : observation
  );
  if (complement) {
    await dossierModel.clearComplement(id);
    await historiqueModel.log({
      user_id: userId,
      action: 'COMPLEMENT_RECU',
      dossier_id: id,
      details: observation || 'Le complément attendu a été fourni.',
    });
  }
  // Traçabilité fine : ouverture d'un traitement par l'agent qui prend en charge
  await tracabiliteService.tracerDebutTraitement(id, userId, observation);
}

/** Soumission à vérification ou demande de correction. */
export async function verifier(id, { resultat, observation }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  const motif = String(observation || '').trim();

  if (resultat === 'COMPLEMENT') {
    return demanderComplement(id, { motif: observation }, userId);
  }

  if (resultat === 'OK') {
    if (current !== EN_TRAITEMENT) {
      throw httpError(409, `Soumission à vérification impossible depuis le statut ${current}.`);
    }
    await workflowService.transition(id, SOUMIS_A_VERIFICATION, userId, motif || 'Soumis à vérification.');
  } else {
    if (![EN_TRAITEMENT, SOUMIS_A_VERIFICATION].includes(current)) {
      throw httpError(409, `Demande de correction impossible depuis le statut ${current}.`);
    }
    if (!motif) {
      throw httpError(422, 'Un motif est obligatoire pour demander une correction.');
    }
    await workflowService.transition(id, CORRECTION_DEMANDEE, userId, motif);
  }
  // Traçabilité fine : fermeture du traitement + trace du contrôle
  await tracabiliteService.tracerFinTraitement(id);
  await tracabiliteService.tracerVerification(id, userId, { resultat, observation });
  await historiqueModel.log({
    user_id: userId,
    action: 'VERIFICATION',
    dossier_id: id,
    details: observation,
  });
}

/** Décision de validation (SOUMIS_A_VERIFICATION → VALIDE | CORRECTION_DEMANDEE). */
export async function valider(id, { decision, commentaire, motif_exception }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== SOUMIS_A_VERIFICATION) {
    throw httpError(409, `Validation impossible depuis le statut ${current}.`);
  }

  if (decision === 'VALIDE') {
    // Contrôle bloquant : champs VISA et pièces obligatoires de dépouillement.
    await controlerCompletudeValidation(id, {
      motifException: motif_exception,
      userId,
    });
    await workflowService.transition(id, VALIDE, userId, commentaire);
  } else {
    const motif = String(commentaire || '').trim();
    if (!motif) {
      throw httpError(422, 'Un motif est obligatoire pour refuser ou renvoyer un dossier.');
    }
    await workflowService.transition(id, CORRECTION_DEMANDEE, userId, motif);
  }
  // Traçabilité fine : décision de validation
  await tracabiliteService.tracerValidation(id, userId, { decision, commentaire });
  await historiqueModel.log({
    user_id: userId,
    action: 'VALIDATION',
    dossier_id: id,
    nouvelle_valeur: decision,
    details: commentaire,
  });
}

/**
 * Signature (VALIDE → SIGNE).
 *
 * La signature appartient au Chef de Service et à personne d'autre. Le contrôle
 * de permission est doublé ici, dans le service : une route mal configurée ne
 * doit pas suffire à faire signer un rôle technique.
 */
export async function signer(id, { reference, observation }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== VALIDE) {
    throw httpError(409, `Signature impossible : le dossier doit être validé (statut actuel : ${current}).`);
  }
  const role = await roleDe(userId);
  if (role !== 'CHEF_SERVICE') {
    throw httpError(
      403,
      'Seul le Chef de Service peut signer un dossier. La vérification de division ne vaut pas signature.'
    );
  }

  await workflowService.transition(id, SIGNE, userId, observation);
  await dossierModel.setSignature(id, { signataireId: userId, reference });
  // Traçabilité fine : signature (décision validée par l'autorité signataire)
  await tracabiliteService.tracerValidation(id, userId, {
    decision: 'SIGNE', commentaire: reference || observation || null,
  });
  await historiqueModel.log({
    user_id: userId,
    action: 'SIGNATURE',
    dossier_id: id,
    details: `Référence de signature : ${reference || 'N/A'}${observation ? ` - ${observation}` : ''}`,
  });
}

export async function cloturer(id, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== SIGNE) {
    throw httpError(409, `Clôture impossible : le dossier doit être signé (statut actuel : ${current}).`);
  }
  await workflowService.transition(id, CLOTURE, userId, 'Clôture du dossier.');
  await dossierModel.cloturer(id);
  await historiqueModel.log({ user_id: userId, action: 'CLOTURE', dossier_id: id });
}

/**
 * Archivage.
 *
 * VISA : le dossier signé peut être archivé directement, sans clôture
 * intermédiaire — le circuit prévoit « Signé à archiver → Archivé ». Les
 * autres divisions passent par la clôture.
 */
export async function archiver(id, userId) {
  const current = await workflowService.getCurrentStatus(id);
  const dossier = await dossierModel.findDossierById(id);
  if (!dossier) throw httpError(404, 'Dossier introuvable.');

  const estVisa = dossier.type_code === 'VISA';
  const statutsAcceptes = estVisa ? [SIGNE, CLOTURE] : [CLOTURE];
  if (!statutsAcceptes.includes(current)) {
    throw httpError(
      409,
      `Archivage impossible depuis le statut ${current}` +
        (estVisa ? ' : le dossier doit être signé.' : ' : le dossier doit être clôturé.')
    );
  }

  await controlerArchivageVisa(dossier, userId);

  await workflowService.transition(id, ARCHIVE, userId, 'Archivage du dossier.');
  await dossierModel.archiver(id);
  await historiqueModel.log({ user_id: userId, action: 'ARCHIVAGE', dossier_id: id });
  await createArchive({ dossier_id: id, archive_par: userId, motif: 'Archivage automatique' });
}

/**
 * Suppression définitive.
 *
 * Elle n'est ouverte qu'à l'administrateur, avec un motif, et seulement avant
 * que le dossier n'entre dans le circuit (reçu, enregistré, orienté). Au-delà,
 * la bonne opération est l'archivage : l'historique doit rester consultable.
 */
export async function deleteDossier(id, userId, motif) {
  const role = await roleDe(userId);
  if (role !== 'ADMIN') {
    throw httpError(403, 'Seul l’administrateur technique peut supprimer un dossier.');
  }
  const motifPropre = String(motif || '').trim();
  if (!motifPropre) {
    throw httpError(422, 'Un motif est obligatoire pour supprimer un dossier.');
  }
  const current = await workflowService.getCurrentStatus(id);
  if (!current) throw httpError(404, 'Dossier introuvable.');
  /* Un dossier déjà pris en charge porte un historique de traitement : c'est
     l'archivage qui convient alors, pas la suppression. Le seuil retenu est
     l'entrée en traitement — un dossier reçu, orienté et affecté, mais dont
     personne n'a encore repris, ne protège aucun travail. */
  if (!['RECU', 'ENREGISTRE', 'ORIENTE', 'AFFECTE'].includes(current)) {
    throw httpError(
      409,
      `Suppression refusée : le dossier a déjà un historique de traitement (${current}). Archivez-le au lieu de le supprimer.`
    );
  }
  const dossier = await dossierModel.findDossierById(id);
  if (!dossier) throw httpError(404, 'Dossier introuvable.');

  /* Le journal du dossier est lié à celui-ci par une clé étrangère en cascade :
     le supprimer effacerait le journal, et la trace de la suppression avec.
     On fige donc le journal et l'identité du dossier dans une table sans
     clé étrangère, qui survit à la suppression. */
  const [username] = await db.query(
    `SELECT username FROM users WHERE id = ?`,
    [userId]
  );
  const historique = await suppressionModel.historiqueDuDossier(id);
  await suppressionModel.createSuppression(dossier, {
    motif: motifPropre,
    userId,
    username: username?.username || null,
    historique: [
      ...historique,
      {
        date_action: new Date().toISOString(),
        action: 'SUPPRESSION_DOSSIER',
        details: `Suppression du dossier ${dossier.numero} — motif : ${motifPropre}`,
        auteur: username?.username || null,
      },
    ],
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'SUPPRESSION_DOSSIER',
    dossier_id: id,
    details: `Suppression du dossier ${dossier?.numero || `#${id}`} — motif : ${motifPropre}`,
  });
  await dossierModel.deleteDossier(id);
  return {
    message: 'Dossier supprimé.',
    trace: 'La suppression est enregistrée avec son motif et l—"instantané du journal.',
  };
}

/** Suppressions de dossiers : la trace durable, consultable par l'audit. */
export async function listSuppressions(options) {
  return suppressionModel.listSuppressions(options);
}

export async function getSuppression(id) {
  return suppressionModel.findSuppression(id);
}

export async function getStatutDossier(id) {
  return workflowService.getCurrentStatus(id);
}

export async function getTransitionsAutorisees(id) {
  const current = await workflowService.getCurrentStatus(id);
  return workflowService.getAllowedTransitions(current);
}

/** Timeline de traçabilité fine du dossier (affectations, traitements, etc.). */
export async function getTracabilite(id) {
  return tracabiliteService.getTimeline(id);
}

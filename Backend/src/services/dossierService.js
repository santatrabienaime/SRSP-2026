import * as dossierModel from '../models/dossierModel.js';
import { createArchive } from '../models/archiveModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import * as notificationModel from '../models/notificationModel.js';
import db from '../config/db.js';
import * as workflowService from './workflowService.js';
import * as tracabiliteService from './tracabiliteService.js';
import * as routageService from './routageService.js';
import { STATUTS, STATUTS_PROTEGES } from '../utils/constants.js';
import { httpError } from '../utils/httpError.js';
import { normaliserCIN } from '../validators/dossierValidators.js';

const { ENREGISTRE, ORIENTE, AFFECTE, EN_TRAITEMENT, SOUMIS_A_VERIFICATION,
        CORRECTION_DEMANDEE, VALIDE, SIGNE, CLOTURE, ARCHIVE } = STATUTS;

export async function getAllDossiers(filters) {
  return dossierModel.findDossiers(filters);
}

export async function getDossierById(id) {
  return dossierModel.findDossierById(id);
}

/**
 * Recherche un CIN déjà connu, pour pré-remplir le formulaire.
 *
 * Le document prévoit ce mécanisme : la secrétaire saisit le CIN, et si la
 * personne est déjà connue, ses coordonnées sont proposées. C'est une aide à
 * la saisie, PAS un blocage : un client revient légitimement, avec un dossier
 * de visa puis un de solde, puis une pension.
 *
 * La comparaison se fait sur le CIN compacté, car il est saisi tantôt avec
 * espaces, tantôt sans. Une personne qui resaisit « 101 234 567 890 » doit être
 * reconnue aussi bien que « 101234567890 ».
 */
export async function rechercherParCIN(matricule) {
  const cin = normaliserCIN(matricule);
  if (!cin) return { trouve: false, dossiers: [] };

  const dossiers = await dossierModel.findDossiersParCIN(cin);
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

  const dossier = await dossierModel.createDossier({
    ...harmoniserDemandeur(data),
    division_id: division.id,
    created_by: userId,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'CREATION_DOSSIER',
    dossier_id: dossier.id,
    details: `Création du dossier ${dossier.numero}`,
  });

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

  // Orientation automatique vers la division du type : le dossier arrive
  // directement dans la file du chef de division, qui en est notifié.
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
    message: `Nouveau dossier ${dossier.numero} enregistré et orienté vers ${division.nom}.`,
    lien: `/dossiers/${dossier.id}`,
  });

  return { ...dossier, division_nom: division.nom, division_code: division.code };
}

export async function updateDossier(id, data, userId) {
  const currentStatut = await workflowService.getCurrentStatus(id);
  if (STATUTS_PROTEGES.includes(currentStatut)) {
    throw httpError(409, 'Ce dossier est clôturé ou archivé : modification interdite.');
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
}

/** Affectation à un agent (ORIENTE → AFFECTE). */
export async function affecter(id, { division_id, agent_id, motif }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (![ENREGISTRE, ORIENTE, AFFECTE, CORRECTION_DEMANDEE].includes(current)) {
    throw httpError(409, `Affectation impossible depuis le statut ${current}.`);
  }
  if (division_id) await dossierModel.setDivision(id, division_id);
  await dossierModel.setAgentResponsable(id, agent_id);
  if (current !== AFFECTE) {
    if (current === ENREGISTRE) {
      await workflowService.transition(id, ORIENTE, userId, `Orientation vers la division ${division_id || ''}.`);
    }
    await workflowService.transition(id, AFFECTE, userId, `Affectation à l'agent ${agent_id}.`);
  }
  // Traçabilité fine : affectation (+ transfert si le dossier change d'agent)
  await tracabiliteService.tracerAffectation(id, {
    division_id, agent_id, motif, userId,
  });
  await historiqueModel.log({
    user_id: userId,
    action: 'AFFECTATION',
    dossier_id: id,
    nouvelle_valeur: `Agent ID ${agent_id}`,
  });
}

/** Prise en charge / traitement (AFFECTE ou CORRECTION_DEMANDEE → EN_TRAITEMENT). */
export async function traiter(id, { observation } = {}, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current === EN_TRAITEMENT) {
    await historiqueModel.log({
      user_id: userId, action: 'TRAITEMENT', dossier_id: id, details: observation,
    });
    return;
  }
  if (![AFFECTE, CORRECTION_DEMANDEE].includes(current)) {
    throw httpError(409, `Traitement impossible depuis le statut ${current}.`);
  }
  await workflowService.transition(id, EN_TRAITEMENT, userId, observation);
  // Traçabilité fine : ouverture d'un traitement par l'agent qui prend en charge
  await tracabiliteService.tracerDebutTraitement(id, userId, observation);
}

/** Soumission à vérification ou demande de correction. */
export async function verifier(id, { resultat, observation }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (resultat === 'OK') {
    if (current !== EN_TRAITEMENT) {
      throw httpError(409, `Soumission à vérification impossible depuis le statut ${current}.`);
    }
    await workflowService.transition(id, SOUMIS_A_VERIFICATION, userId, observation || 'Soumis à vérification.');
  } else {
    if (![EN_TRAITEMENT, SOUMIS_A_VERIFICATION].includes(current)) {
      throw httpError(409, `Demande de correction impossible depuis le statut ${current}.`);
    }
    await workflowService.transition(id, CORRECTION_DEMANDEE, userId, observation);
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
export async function valider(id, { decision, commentaire }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== SOUMIS_A_VERIFICATION) {
    throw httpError(409, `Validation impossible depuis le statut ${current}.`);
  }
  if (decision === 'VALIDE') {
    await workflowService.transition(id, VALIDE, userId, commentaire);
  } else {
    await workflowService.transition(id, CORRECTION_DEMANDEE, userId, commentaire);
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

/** Signature (VALIDE → SIGNE). */
export async function signer(id, { reference, observation }, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== VALIDE) {
    throw httpError(409, `Signature impossible : le dossier doit être validé (statut actuel : ${current}).`);
  }
  await workflowService.transition(id, SIGNE, userId, observation);
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

export async function archiver(id, userId) {
  const current = await workflowService.getCurrentStatus(id);
  if (current !== CLOTURE) {
    throw httpError(409, `Archivage impossible : le dossier doit être clôturé (statut actuel : ${current}).`);
  }
  await workflowService.transition(id, ARCHIVE, userId, 'Archivage du dossier.');
  await dossierModel.archiver(id);
  await historiqueModel.log({ user_id: userId, action: 'ARCHIVAGE', dossier_id: id });
  await createArchive({ dossier_id: id, archive_par: userId, motif: 'Archivage automatique' });
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
import * as model from '../models/immatriculationModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import db from '../config/db.js';
import { verifierCoherencePaiement } from '../validators/administratifValidators.js';
import { httpError } from '../utils/httpError.js';

/**
 * Module d'immatriculation de la Coordination.
 *
 * Trois gestes, dans l'ordre où ils se produisent :
 *
 *   1. **l'immatriculation** — un agent public nouveau reçoit une référence ;
 *   2. l'**insertion en paie** — ses éléments sont saisis pour les systèmes
 *      de paie et de pension ;
 *   3. le **changement de mode de paiement** — la décision qui change où va
 *      l'argent, et qui exige un motif.
 *
 * Deux contrôles Crossing le cahier :
 *
 *   - le **doublon** est signalé avant l'attribution, pas découvert à la
 *     paie : le matricule et le CIN ne peuvent pas être partagés ;
 *   - le **motif** du changement de paiement est obligatoire, et les pièces
 *     justificatives sont cochées — une décision sans motif ne s'explique ni
 *     ne s'audite.
 *
 * La Coordination n'a aucun pouvoir sur les dossiers : elle enregistre des
 * actes administratifs, elle ne décide de rien.
 */

/** Liste des immatriculations. */
export async function lister(options) {
  return model.listImmatriculations(options);
}

/** Une immatriculation et son historique. */
export async function detail(id) {
  const imma = await model.findImmatriculation(id);
  if (!imma) throw httpError(404, 'Immatriculation introuvable.');
  return imma;
}

/**
 * Enregistre une demande d'immatriculation.
 *
 * La référence est attribuée d'office : c'est la demande d'immatriculation
 * qui la déclenche, et la coordination doit pouvoir en répondre à l'agent
 * sans repasser par un autre service.
 */
export async function creer(data, userId) {
  /* Le doublon est signalé AVANT l'attribution. */
  if (data.cin) {
    const connu = await model.cinDejaConnu(data.cin);
    if (connu) {
      throw httpError(
        409,
        `Le CIN ${data.cin} est déjà connu (${connu.prenom} ${connu.nom}). `
        + 'Vérifiez la demande avant de l’enregistrer.'
      );
    }
  }
  if (data.matricule) {
    const pris = await model.matriculeDejaAttribue(data.matricule);
    if (pris) {
      throw httpError(
        409,
        `Le matricule ${data.matricule} est déjà attribué (${pris.prenom} ${pris.nom}).`
      );
    }
  }

  const reference = await model.attribuerReference();
  const enregistrement = await model.createImmatriculation(
    { ...data, matricule: data.matricule || reference },
    userId
  );

  await historiqueModel.log({
    user_id: userId,
    action: 'IMMATRICULATION',
    details: `Demande d’immatriculation ${reference} — ${data.nom} ${data.prenom}.`,
  });

  return { ...enregistrement, reference };
}

/** Modifie une immatriculation. */
export async function modifier(id, data, userId) {
  const imma = await model.findImmatriculation(id);
  if (!imma) throw httpError(404, 'Immatriculation introuvable.');

  if (data.cin) {
    const connu = await model.cinDejaConnu(data.cin, id);
    if (connu) {
      throw httpError(409, `Le CIN ${data.cin} est déjà connu (${connu.prenom} ${connu.nom}).`);
    }
  }
  if (data.matricule) {
    const pris = await model.matriculeDejaAttribue(data.matricule, id);
    if (pris) {
      throw httpError(409, `Le matricule ${data.matricule} est déjà attribué (${pris.prenom} ${pris.nom}).`);
    }
  }

  const resultat = await model.updateImmatriculation(id, data);
  await historiqueModel.log({
    user_id: userId,
    action: 'IMMATRICULATION',
    details: `Immatriculation ${imma.matricule || id} modifiée.`,
  });
  return resultat;
}

/** Enregistre l'insertion en paie d'un nouvel arrivant. */
export async function enregistrerInsertion(immatriculationId, data, userId) {
  const imma = await model.findImmatriculation(immatriculationId);
  if (!imma) throw httpError(404, 'Immatriculation introuvable.');

  const resultat = await model.createInsertion(
    { ...data, immatriculation_id: Number(immatriculationId) },
    userId
  );

  await historiqueModel.log({
    user_id: userId,
    action: 'INSERTION_PAIE',
    details: `Insertion en paie préparée pour ${imma.nom} ${imma.prenom}.`,
  });
  return resultat;
}

/** Met à jour l'insertion en paie. */
export async function modifierInsertion(immatriculationId, insertionId, data, userId) {
  const [insertion] = await db.query(
    'SELECT * FROM insertions_paiement WHERE id = ? AND immatriculation_id = ?',
    [insertionId, immatriculationId]
  );
  if (!insertion) throw httpError(404, 'Insertion en paie introuvable.');

  const resultat = await model.updateInsertion(insertionId, data);
  await historiqueModel.log({
    user_id: userId,
    action: 'INSERTION_PAIE',
    details: 'Insertion en paie mise à jour.',
  });
  return resultat;
}

/**
 * Enregistre une demande de changement de mode de paiement.
 *
 * La cohérence est vérifiée ici, et pas seulement dans le formulaire : un
 * virement sans numéro de compte passe la saisie et échoue plus tard, à la
 * banque.
 */
export async function enregistrerChangementPaiement(immatriculationId, data, userId) {
  const imma = await model.findImmatriculation(immatriculationId);
  if (!imma) throw httpError(404, 'Immatriculation introuvable.');

  const probleme = verifierCoherencePaiement(data);
  if (probleme) throw httpError(422, probleme);

  const resultat = await model.createChangementPaiement(
    { ...data, immatriculation_id: Number(immatriculationId) },
    userId
  );

  await historiqueModel.log({
    user_id: userId,
    action: 'CHANGEMENT_MODE_PAIEMENT',
    details: `Demande de changement de mode de paiement (${data.mode}) — motif : ${data.motif}`,
  });
  return resultat;
}

/** Met à jour une demande de changement de mode de paiement. */
export async function modifierChangementPaiement(immatriculationId, paiementId, data, userId) {
  const [paiement] = await db.query(
    'SELECT * FROM modes_paiement WHERE id = ? AND immatriculation_id = ?',
    [paiementId, immatriculationId]
  );
  if (!paiement) throw httpError(404, 'Demande de changement introuvable.');

  const coherence = verifierCoherencePaiement({ ...paiement, ...data });
  if (coherence) throw httpError(422, coherence);

  const resultat = await model.updateChangementPaiement(paiementId, data);
  await historiqueModel.log({
    user_id: userId,
    action: 'CHANGEMENT_MODE_PAIEMENT',
    details: 'Demande de changement de mode de paiement mise à jour.',
  });
  return resultat;
}

/** Volumes par type de demande, période et division. */
export async function volumes(options) {
  return model.volumes(options);
}

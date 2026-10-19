import * as courrierModel from '../models/courrierModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import * as notificationModel from '../models/notificationModel.js';

/** Lien de la fiche d'un courrier : sert à la notification comme à sa purge. */
const lienCourrier = (id) => `/courriers/${id}`;

export async function getCourriers(filters) {
  return courrierModel.findCourriers(filters);
}

export async function getCourrierById(id) {
  return courrierModel.findCourrierById(id);
}

export async function createCourrier(data, userId) {
  const courrier = await courrierModel.createCourrier({ ...data, created_by: userId });
  await historiqueModel.log({
    user_id: userId,
    action: 'CREATION_COURRIER',
    details: `Courrier ${courrier.numero}`,
  });

  /* Le Chef BAAF a la charge du courrier du service : chaque nouvelle pièce le
     concerne. L'auteur du courrier est écarté de l'envoi — se notifier de son
     propre geste n'apprend rien. Le courrier n'étant rattaché à aucun dossier
     en propre, la notification reste indépendante pour chaque pièce (la clé de
     déduplication porte sur le dossier, ici absent). */
  await notificationModel.notifyRole('CHEF_BAAF', {
    type: 'COURRIER',
    action: 'COURRIER',
    message: `Nouveau courrier ${data.sens === 'ENTRANT' ? 'entrant' : 'sortant'} ${courrier.numero} — ${data.objet}.`,
    lien: lienCourrier(courrier.id),
  }, { exclure: userId });

  return courrier;
}

export async function updateStatut(id, statut) {
  return courrierModel.updateStatut(id, statut);
}

export async function deleteCourrier(id, userId) {
  await historiqueModel.log({
    user_id: userId,
    action: 'SUPPRESSION_COURRIER',
    details: `Suppression du courrier #${id}`,
  });
  // L'alerte qui menait à cette pièce part avec elle.
  await notificationModel.supprimerParLien(lienCourrier(id));
  await courrierModel.deleteCourrier(id);
}
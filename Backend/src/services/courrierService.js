import * as courrierModel from '../models/courrierModel.js';
import * as historiqueModel from '../models/historiqueModel.js';

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
  return courrier;
}

export async function updateStatut(id, statut) {
  return courrierModel.updateStatut(id, statut);
}
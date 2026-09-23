import * as historiqueModel from '../models/historiqueModel.js';

export async function getHistorique(filters) {
  return historiqueModel.findAll(filters);
}

export async function log(data) {
  return historiqueModel.log(data);
}
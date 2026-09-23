import db from '../config/db.js';

export async function getTypesDossiers() {
  return db.query(
    `SELECT id, code, libelle, description, actif
     FROM types_dossiers ORDER BY id`
  );
}

export async function getPriorites() {
  return db.query(
    `SELECT id, libelle, niveau FROM priorites ORDER BY niveau DESC`
  );
}

export async function getFonctions() {
  return db.query(
    `SELECT id, libelle, description FROM fonctions ORDER BY libelle`
  );
}

export async function getTypesCourriers() {
  return db.query(
    `SELECT id, libelle FROM types_courriers ORDER BY libelle`
  );
}

export async function getTypesDocuments() {
  return db.query(
    `SELECT id, libelle, extensions_autorisees, taille_max
     FROM types_documents ORDER BY libelle`
  );
}

export async function getStatuts() {
  return db.query(
    `SELECT id, code, libelle, ordre FROM statuts_dossiers ORDER BY ordre`
  );
}
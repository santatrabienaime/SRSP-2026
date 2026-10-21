import * as referentielModel from '../models/referentielModel.js';

/** Retourne l'ensemble des données de référence nécessaires aux formulaires. */
export async function getReferentiel() {
  const [
    types_dossiers, sous_types, priorites, fonctions, types_courriers,
    types_documents, types_pieces, statuts,
  ] = await Promise.all([
    referentielModel.getTypesDossiers(),
    referentielModel.getSousTypes(),
    referentielModel.getPriorites(),
    referentielModel.getFonctions(),
    referentielModel.getTypesCourriers(),
    referentielModel.getTypesDocuments(),
    referentielModel.getTypesPieces(),
    referentielModel.getStatuts(),
  ]);
  return {
    types_dossiers, sous_types, priorites, fonctions, types_courriers,
    types_documents, types_pieces, statuts,
  };
}
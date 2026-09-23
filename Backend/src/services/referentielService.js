import * as referentielModel from '../models/referentielModel.js';

/** Retourne l'ensemble des données de référence nécessaires aux formulaires. */
export async function getReferentiel() {
  const [types_dossiers, priorites, fonctions, types_courriers, types_documents, statuts] =
    await Promise.all([
      referentielModel.getTypesDossiers(),
      referentielModel.getPriorites(),
      referentielModel.getFonctions(),
      referentielModel.getTypesCourriers(),
      referentielModel.getTypesDocuments(),
      referentielModel.getStatuts(),
    ]);
  return { types_dossiers, priorites, fonctions, types_courriers, types_documents, statuts };
}
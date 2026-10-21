import * as schemaModel from '../models/schemaOperationModel.js';

/**
 * Schémas de données par type d'opération — contrôleur.
 *
 * Ce sont les **mêmes** champs que le formulaire propose à l'agent : le
 * contrôleur ne connaît pas le détail d'un type d'opération, il manipule
 * des champs (clé, libellé, type, obligatoire, aide). C'est ce qui permet
 * d'ajouter un champ sans toucher au code.
 */
export async function lister(req, res, next) {
  try {
    const [schemas, sansSchema] = await Promise.all([
      schemaModel.listSchemasOperations(),
      schemaModel.listOperationsSansSchema(),
    ]);
    res.json({ schemas, operations_sans_schema: sansSchema });
  } catch (error) { next(error); }
}

export async function remplacer(req, res, next) {
  try {
    const resultat = await schemaModel.remplacerChampsOperation(
      req.params.id,
      req.body?.champs
    );
    res.json(resultat || { message: 'Schéma enregistré.' });
  } catch (error) { next(error); }
}

export async function supprimerChamp(req, res, next) {
  try {
    res.json(await schemaModel.supprimerChamp(req.params.champId));
  } catch (error) { next(error); }
}

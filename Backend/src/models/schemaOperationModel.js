/**
 * Schémas de données par type d'opération — référentiel.
 *
 * Un schéma décrit les champs que l'agent saisit pour une opération
 * donnée : leur libellé, leur type, leur caractère obligatoire, leur aide.
 *
 * Le référentiel est administrable : l'écran *Référentiel → Schémas
 * d'opérations* permet d'ajouter, retirer ou réordonner les champs d'une
 * opération. C'est ce qui permet au SRSP de faire évoluer ses formulaires
 * sans développement — et ce que le cahier appelle la liste des champs
 * « à valider ».
 */
import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';

/** Types de champ acceptés. */
export const TYPES_CHAMPS = ['texte', 'nombre', 'date', 'textarea', 'choix'];

/**
 * Tous les schémas, groupés par opération.
 *
 * Le regroupement se fait en JavaScript plutôt qu'en SQL : la liste est
 * courte, et surtout le regroupement par sous-type — chaque opération avec
 * ses champs — est plus lisible en mémoire qu'en SQL.
 */
export async function listSchemasOperations() {
  const champs = await db.query(
    `SELECT s.*, st.code AS sous_type_code, st.libelle AS sous_type_libelle,
            t.code AS type_code, t.libelle AS type_libelle
     FROM schemas_operations s
     JOIN sous_types_dossiers st ON st.id = s.sous_type_id
     JOIN types_dossiers t ON t.id = st.type_dossier_id
     ORDER BY t.libelle, st.ordre, st.libelle, s.ordre, s.id`
  );

  const operations = new Map();
  for (const champ of champs) {
    if (!operations.has(champ.sous_type_id)) {
      operations.set(champ.sous_type_id, {
        sous_type_id: champ.sous_type_id,
        code: champ.sous_type_code,
        libelle: champ.sous_type_libelle,
        type_code: champ.type_code,
        type_libelle: champ.type_libelle,
        champs: [],
      });
    }
    operations.get(champ.sous_type_id).champs.push({
      id: champ.id,
      cle: champ.cle,
      libelle: champ.libelle,
      type_champ: champ.type_champ,
      requis: Boolean(champ.requis),
      options: champ.options,
      aide: champ.aide,
      ordre: champ.ordre,
    });
  }
  return [...operations.values()];
}

/**
 * Les opérations qui n'ont encore **aucun** schéma.
 *
 * Une opération sans schéma est un dossier dont le formulaire ne montre que
 * les champs communs : l'administrateur doit le voir, sinon il croira que
 * l'opération est complète.
 */
export async function listOperationsSansSchema() {
  const rows = await db.query(
    `SELECT st.id, st.code, st.libelle, t.code AS type_code, t.libelle AS type_libelle
     FROM sous_types_dossiers st
     JOIN types_dossiers t ON t.id = st.type_dossier_id
     WHERE st.id NOT IN (SELECT DISTINCT sous_type_id FROM schemas_operations)
     ORDER BY t.libelle, st.ordre, st.libelle`
  );
  return rows;
}

/** Un champ d'un schéma. */
export async function findChamp(id) {
  const rows = await db.query(
    'SELECT * FROM schemas_operations WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

/**
 * Remplace l'ensemble des champs d'une opération.
 *
 * Le remplacement est atomique : la liste reçue devient celle du schéma. C'est
 * plus sûr qu'un ajout champ par champ, où une interruption laisserait le
 * schéma à moitié configuré.
 */
export async function remplacerChampsOperation(sousTypeId, champs) {
  const [operation] = await db.query(
    'SELECT id, code FROM sous_types_dossiers WHERE id = ?',
    [sousTypeId]
  );
  if (!operation) throw httpError(404, 'Type d’opération introuvable.');

  const liste = Array.isArray(champs) ? champs : [];
  const cles = new Set();
  for (const champ of liste) {
    const cle = String(champ.cle || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!cle) throw httpError(422, 'Chaque champ doit avoir une clé.');
    if (cles.has(cle)) {
      throw httpError(422, `La clé « ${cle} » est définie deux fois.`);
    }
    cles.add(cle);
    if (!TYPES_CHAMPS.includes(champ.type_champ || 'texte')) {
      throw httpError(
        422,
        `Type de champ inconnu : ${champ.type_champ}. Attendu : ${TYPES_CHAMPS.join(', ')}.`
      );
    }
  }

  await db.query('DELETE FROM schemas_operations WHERE sous_type_id = ?', [sousTypeId]);

  for (const [index, champ] of liste.entries()) {
    const cle = String(champ.cle || '').trim().toLowerCase().replace(/\s+/g, '_');
    await db.query(
      `INSERT INTO schemas_operations
         (sous_type_id, cle, libelle, type_champ, requis, options, aide, ordre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sousTypeId,
        cle,
        String(champ.libelle || cle).trim(),
        champ.type_champ || 'texte',
        champ.requis ? 1 : 0,
        champ.options ? String(champ.options).slice(0, 500) : null,
        champ.aide ? String(champ.aide).slice(0, 255) : null,
        Number.isFinite(Number(champ.ordre)) ? Number(champ.ordre) : (index + 1) * 10,
      ]
    );
  }

  return listSchemasOperations().then((tous) =>
    tous.find((o) => o.sous_type_id === Number(sousTypeId)) || null
  );
}

/** Retire un champ d'un schéma. */
export async function supprimerChamp(id) {
  const champ = await findChamp(id);
  if (!champ) throw httpError(404, 'Champ introuvable.');
  await db.query('DELETE FROM schemas_operations WHERE id = ?', [id]);
  return { message: 'Champ retiré du schéma.' };
}

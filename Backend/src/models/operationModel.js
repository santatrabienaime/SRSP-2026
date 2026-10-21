import db from '../config/db.js';

/**
 * Données propres à l'opération d'un dossier.
 *
 * Toutes les divisions partagent le même jeu de champs — référence du dossier
 * mère, période, montant et sa source, localité, contrôle, signature,
 * transmission — mais n'en utilisent qu'une partie, selon l'opération.
 *
 * Une ligne par dossier : c'est le dossier qui porte le type d'opération, et
 * la ligne en reprend le détail. Un dossier qui n'en a pas encore n'est pas
 * un dossier incomplet : la donnée est simply absente.
 */

const COLONNES = [
  'reference_externe',
  'reference_dossier_mere',
  'matricule',
  'periode',
  'montant',
  'source_montant',
  'date_reference',
  'destinataire',
  'date_transmission',
  'reference_transmission',
  'etat_transmission',
  'localisation',
  'observation',
  'controleur_id',
  'date_controle',
  'observations_controle',
  'decision_controle',
  'valide_par',
  'date_validation',
];

/**
 * Champs génériques : ceux qui sont des colonnes de la table.
 *
 * Un champ du schéma qui porte l'un de ces noms est stocké dans sa colonne ;
 * les autres vont dans le champ JSON `donnees`. Un seul mécanisme pour
 * l'agent : tous les champs d'un formulaire se saisissent de la même façon.
 */
export const COLONNES_EDITABLES = [
  'reference_externe',
  'reference_dossier_mere',
  'matricule',
  'periode',
  'montant',
  'source_montant',
  'date_reference',
  'destinataire',
  'date_transmission',
  'reference_transmission',
  'etat_transmission',
  'localisation',
  'observation',
];

/**
 * Schéma des champs d'un type d'opération.
 *
 * Le schéma décrit ce que l'agent doit saisir pour l'opération qu'il
 * instruit : un transfert de localité n'a pas de « période concernée », et
 * une fiche de contrôle a une « version produite ». Sans schéma, le
 * formulaire porterait tous les champs pour toutes les opérations.
 */
export async function schemaOperation(sousTypeId) {
  if (!sousTypeId) return [];
  return db.query(
    `SELECT cle, libelle, type_champ, requis, options, aide, ordre
     FROM schemas_operations
     WHERE sous_type_id = ?
     ORDER BY ordre, id`,
    [sousTypeId]
  );
}

/**
 * Schéma d'un type d'opération, avec le code et le libellé de l'opération.
 */
export async function schemaAvecOperation(sousTypeId) {
  if (!sousTypeId) return null;
  const [operation] = await db.query(
    'SELECT id, code, libelle FROM sous_types_dossiers WHERE id = ?',
    [sousTypeId]
  );
  if (!operation) return null;
  const champs = await schemaOperation(sousTypeId);
  return { ...operation, champs };
}

/** Lecture des données d'opération d'un dossier. */
export async function findParDossier(dossierId) {
  const rows = await db.query(
    `SELECT o.*,
            u.username AS controleur_username,
            v.username AS valide_par_username,
            st.code AS sous_type_code, st.libelle AS sous_type_libelle
     FROM donnees_operation o
     LEFT JOIN users u ON u.id = o.controleur_id
     LEFT JOIN users v ON v.id = o.valide_par
     LEFT JOIN sous_types_dossiers st ON st.id = o.sous_type_id
     WHERE o.dossier_id = ?
     LIMIT 1`,
    [dossierId]
  );
  if (!rows[0]) return null;
  const ligne = rows[0];
  /* Le champ JSON peut être une chaîne (MySQL le rend ainsi selon le
     connecteur) : on le normalise en objet. */
  let donnees = ligne.donnees;
  if (typeof donnees === 'string') {
    try { donnees = JSON.parse(donnees); } catch { donnees = null; }
  }
  return { ...ligne, donnees: donnees || null };
}

/**
 * Enregistre les données d'opération.
 *
 * L'écriture est un « upsert » : la donnée n'existe pas avant d'être
 * saisie, et une modification la met à jour sans créer de doublon.
 */
export async function enregistrer(dossierId, data) {
  const sousTypeId = data.sous_type_id || null;

  const [existant] = await db.query(
    'SELECT id FROM donnees_operation WHERE dossier_id = ?',
    [dossierId]
  );

  /* Seuls les champs fournis sont écrits : un envoi partiel ne doit pas
     effacer ce qui a été saisi. */
  const colonnes = [];
  const valeurs = [];

  for (const colonne of COLONNES) {
    if (data[colonne] === undefined) continue;
    colonnes.push(colonne);
    valeurs.push(data[colonne] === '' ? null : data[colonne]);
  }

  if (data.donnees !== undefined) {
    colonnes.push('donnees');
    valeurs.push(data.donnees ? JSON.stringify(data.donnees) : null);
  }
  colonnes.push('sous_type_id');
  valeurs.push(sousTypeId);

  if (!colonnes.length) return findParDossier(dossierId);

  if (existant) {
    const sets = colonnes.map((c) => `${c} = ?`);
    await db.query(
      `UPDATE donnees_operation SET ${sets.join(', ')} WHERE id = ?`,
      [...valeurs, existant.id]
    );
  } else {
    /* L'INSERT porte les mêmes colonnes que l'UPDATE : les valeurs et les
       colonnes doivent avancer ensemble, sinon la requête est malformée. */
    await db.query(
      `INSERT INTO donnees_operation (dossier_id, ${colonnes.join(', ')})
       VALUES (?, ${colonnes.map(() => '?').join(', ')})`,
      [dossierId, ...valeurs]
    );
  }
  return findParDossier(dossierId);
}

/**
 * Enregistre la validation d'un contrôle.
 *
 * L'agent qui contrôle est noté, la décision est conservée, et la date est
 * celle du contrôle — pas celle de la saisie. C'est la preuve qui compte
 * dans un dossier de solde ou de pension.
 */
export async function controler(dossierId, { controleurId, decision, observations, dateControle }) {
  await db.query(
    `INSERT INTO donnees_operation
       (dossier_id, controleur_id, decision_controle, observations_controle, date_controle)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       controleur_id = VALUES(controleur_id),
       decision_controle = VALUES(decision_controle),
       observations_controle = VALUES(observations_controle),
       date_controle = VALUES(date_controle)`,
    [dossierId, controleurId || null, decision || null, observations || null, dateControle || null]
  );
  return findParDossier(dossierId);
}

/**
 * Enregistre la validation d'un montant ou d'un décompte.
 *
 * Les observations de validation ne **remplacent pas** celles du contrôle :
 * ce sont deux voix distinctes — la note du contrôleur et celle du validateur —
 * et la seconde ne doit pas effacer la première. La validation porte donc son
 * observation dans le champ général.
 */
export async function valider(dossierId, { validePar, dateValidation, observations }) {
  await db.query(
    `INSERT INTO donnees_operation (dossier_id, valide_par, date_validation, observation)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       valide_par = VALUES(valide_par),
       date_validation = VALUES(date_validation),
       observation = VALUES(observation)`,
    [dossierId, validePar || null, dateValidation || null, observations || null]
  );
  return findParDossier(dossierId);
}

/**
 * Agrégat par type d'opération, pour les rapports de division.
 *
 * Chaque ligne porte le nombre de dossiers et, le cas échéant, la somme des
 * montants saisis. La somme porte sur les montants **saisis** : aucun calcul
 * n'est fait ici, et aucun montant n'est déduit d'une formule.
 */
export async function agregatParOperation({ sousTypeIds, dateDebut, dateFin, divisionCode } = {}) {
  const where = ['o.dossier_id IS NOT NULL'];
  const params = [];

  if (sousTypeIds && sousTypeIds.length) {
    where.push(`st.id IN (${sousTypeIds.map(() => '?').join(',')})`);
    params.push(...sousTypeIds);
  }
  if (divisionCode) {
    where.push('dv.code = ?');
    params.push(divisionCode);
  }
  if (dateDebut) {
    where.push('d.date_reception >= ?');
    params.push(dateDebut);
  }
  if (dateFin) {
    where.push('d.date_reception <= ?');
    params.push(dateFin);
  }

  return db.query(
    `SELECT st.id AS sous_type_id, st.code AS sous_type_code, st.libelle AS sous_type_libelle,
            COUNT(d.id) AS total,
            COALESCE(SUM(o.montant), 0) AS montant_total,
            COALESCE(SUM(CASE WHEN o.valide_par IS NOT NULL THEN 1 ELSE 0 END), 0) AS valides,
            COALESCE(SUM(CASE WHEN o.montant IS NOT NULL AND o.valide_par IS NULL THEN 1 ELSE 0 END), 0) AS en_attente_validation
     FROM donnees_operation o
     JOIN dossiers d ON d.id = o.dossier_id
     JOIN sous_types_dossiers st ON st.id = o.sous_type_id
     JOIN divisions dv ON dv.id = d.division_id
     WHERE ${where.join(' AND ')}
     GROUP BY st.id, st.code, st.libelle
     ORDER BY st.ordre, st.libelle`,
    params
  );
}

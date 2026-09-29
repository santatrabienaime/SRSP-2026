import db from '../config/db.js';

/**
 * Numérotation des dossiers.
 *
 * Format : {TYPE}-{ANNEE}-{6CHIFFRES}, par exemple VISA-2026-000001.
 *
 * Le numéro vient d'un COMPTEUR EN BASE, incrémenté en une seule instruction.
 *
 * Le calcul par COUNT(*) + 1, utilisé jusqu'ici, n'est pas atomique : deux
 * requêtes simultanées lisent le même total avant que l'une n'écrive, et
 * rendent le même numéro. La contrainte d'unicité rejetait alors la seconde
 * création. Reproduit : sur six dossiers Secours créés en parallèle, trois
 * échouaient avec « Duplicate entry for key 'numero' ». C'est le régime
 * normal d'un service qui reçoit plusieurs dossiers dans la journée : la
 * secrétaire saisit deux dossiers, l'un est refusé, et le message ne dit pas
 * pourquoi.
 *
 * `LAST_INSERT_ID(expr)` renvoie la valeur neuve ET l'incrémente en une seule
 * instruction : MariaDB verrouille la ligne pour la durée de l'instruction, si
 * bien que deux appels concurrents obtiennent deux numéros différents. La
 * seconde lecture de LAST_INSERT_ID() est faite par la même connexion, ce qui
 * est ici le cas : toutes les requêtes passent par le même pool.
 */
export async function generateDossierNumber(typeId, connexion = null) {
  const runner = connexion || db;
  const year = new Date().getFullYear();

  let prefix = 'DOS';
  if (typeId) {
    const rows = await runner.query('SELECT code FROM types_dossiers WHERE id = ?', [typeId]);
    if (rows[0]?.code) prefix = rows[0].code;
  }

  /* Un numéro par type ET par année : les compteurs de 2027 ne doivent pas
     repartir du compteur de 2026. La clé porte donc l'année. */
  const cle = `DOSSIER-${typeId || 0}-${year}`;

  /* La ligne est créée si elle n'existe pas. LAST_INSERT_ID 0 évite d'écraser
     un compteur déjà advanced par un appel concurrent qui aurait fait
     INSERT ... ON DUPLICATE sans cette valeur initiale. */
  await runner.query(
    'INSERT INTO compteurs_numerotation (cle, valeur) VALUES (?, 0) ON DUPLICATE KEY UPDATE cle = cle',
    [cle]
  );

  await runner.query(
    'UPDATE compteurs_numerotation SET valeur = LAST_INSERT_ID(valeur + 1) WHERE cle = ?',
    [cle]
  );

  const lignes = await runner.query('SELECT LAST_INSERT_ID() AS n');
  const n = lignes[0]?.n || 1;

  return `${prefix}-${year}-${String(n).padStart(6, '0')}`;
}

/**
 * Remet un compteur au maximum réellement attribué.
 *
 * Appelée après la restauration d'une sauvegarde, ou après un import : sans
 * cela, le compteur repartirait de 1 et le premier dossier créé entrerait en
 * collision avec un numéro déjà utilisé.
 */
export async function resynchroniserCompteur(typeId, annee = new Date().getFullYear(), runner = db) {
  const lignes = await runner.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(numero, '-', -1) AS UNSIGNED)), 0) AS max
     FROM dossiers WHERE numero LIKE ?`,
    [`-${annee}-%`]
  );
  const max = Number(lignes[0]?.max || 0);
  const cle = `DOSSIER-${typeId || 0}-${annee}`;
  await runner.query(
    `INSERT INTO compteurs_numerotation (cle, valeur) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE valeur = GREATEST(valeur, VALUES(valeur))`,
    [cle, max]
  );
  return { cle, valeur: max };
}

export default generateDossierNumber;

import db from '../config/db.js';

/**
 * Numérotation des dossiers.
 *
 * Format : {TYPE}-{ANNEE}-{6CHIFFRES}, par exemple VISA-2026-000001.
 *
 * Le numéro vient d'un COMPTEUR EN BASE, incrémenté en une seule instruction.
 * Le calcul par COUNT(*) + 1 n'est pas atomique : deux requêtes simultanées
 * lisent le même total avant que l'une n'écrive, et rendent le même numéro.
 *
 * PostgreSQL verrouille la ligne pendant l'UPDATE ... RETURNING : deux appels
 * concurrents obtiennent deux valeurs distinctes, sans verrou applicatif.
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

  /* La ligne est créée si elle n'existe pas. La valeur initiale 0 n'écrase
     jamais un compteur déjà avancé par un appel concurrent. */
  await runner.query(
    'INSERT INTO compteurs_numerotation (cle, valeur) VALUES (?, 0) ON CONFLICT (cle) DO NOTHING',
    [cle]
  );

  const resultat = await runner.query(
    'UPDATE compteurs_numerotation SET valeur = valeur + 1 WHERE cle = ? RETURNING valeur',
    [cle]
  );
  const n = resultat.rows?.[0]?.valeur ?? 1;

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
    `SELECT COALESCE(MAX(CAST(regexp_replace(numero, '^.*-', '') AS INTEGER)), 0) AS max
     FROM dossiers WHERE numero LIKE ?`,
    [`-${annee}-%`]
  );
  const max = Number(lignes[0]?.max || 0);
  const cle = `DOSSIER-${typeId || 0}-${annee}`;
  await runner.query(
    `INSERT INTO compteurs_numerotation (cle, valeur) VALUES (?, ?)
     ON CONFLICT (cle) DO UPDATE SET valeur = GREATEST(compteurs_numerotation.valeur, EXCLUDED.valeur)`,
    [cle, max]
  );
  return { cle, valeur: max };
}

export default generateDossierNumber;

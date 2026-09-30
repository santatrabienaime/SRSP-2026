/* Intégrité référentielle de la base.
 *
 * Une clé étrangèredeclaree n empêche pas les references mortes si elle n'est
 * pas declaree en base. Ce controle releve donc, table par table, les colonnes
 * terminant par _id et _par, et cherche une reference qui n existe pas.
 *
 * Il cherche aussi les doublons logiques : deux lignes qui ont le meme sens
 * metier sans que la base les empeche. Une contrainte d unicite manquante
 * laisse passer ces doublons, et ils deviennent invisibles ensuite.
 */
import db from '../src/config/db.js';

let ko = 0;
const v = (libelle, conforme, detail = '') => {
  if (!conforme) ko++;
  console.log(`  ${conforme ? '✅' : '❌'} ${libelle}${detail ? ' — ' + detail : ''}`);
};

const nomTable = (r) => Object.values(r)[0];
const tables = (await db.query('SHOW TABLES')).map(nomTable)
  .filter((t) => !['information_schema', 'performance_schema', 'mysql', 'sys'].includes(t));

console.log(`=== 1. REFERENCES MORTES (${tables.length} tables) ===`);
/* La table cible est lue dans information_schema, et déduite du NOM de la
   colonne.
   
   La déduire par convention donnait trois faux positifs : `courriers.type_id`
   et `documents.type_id` pointent l'un vers `types_courriers`, l'autre vers
   `types_documents` — pas vers `types_dossiers`, dont le nom « type_id »
   suggérait le rapprochement. Les clés étrangères étant bel et bien
   déclarées, l'audit annonçait des données corrompues là où la base était
   saine : un audit qui se trompe conduit à « réparer » des données intactes.
   MariaDB dit la vérité, et il sait. */
const cibles = await db.query(
  `SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
   FROM information_schema.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`
);

let totalOrphelines = 0;
const detailsOrphelines = [];
for (const fk of cibles) {
  const n = await db.query(
    `SELECT COUNT(*) AS n FROM \`${fk.TABLE_NAME}\` o
     LEFT JOIN \`${fk.REFERENCED_TABLE_NAME}\` r ON r.id = o.\`${fk.COLUMN_NAME}\`
     WHERE o.\`${fk.COLUMN_NAME}\` IS NOT NULL AND r.id IS NULL`
  );
  const total = Number(n[0]?.n || 0);
  if (total > 0) {
    totalOrphelines += total;
    detailsOrphelines.push(
      `  ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME} : ${total} référence(s) morte(s)`
    );
  }
}
v(`aucune référence morte parmi les ${cibles.length} clés étrangères`,
  totalOrphelines === 0,
  detailsOrphelines.length ? `\n${detailsOrphelines.join('\n')}` : 'aucune');

/* Une colonne terminant par _id SANS clé étrangère est un risque : rien
   n'empêche d'y écrire un identifiant inexistant. */
const sansCle = [];
for (const t of tables) {
  const colonnes = await db.query(`SHOW COLUMNS FROM \`${t}\``);
  for (const c of colonnes) {
    if (!/(_id|_par)$/.test(c.Field) || c.Field === 'id') continue;
    const declaree = cibles.some(
      (f) => f.TABLE_NAME === t && f.COLUMN_NAME === c.Field
    );
    /* Deux exceptions, toutes deux justifiées :
       - `visas_controle_financier.signe_par` est la signature MANUSCrite du
         contrôle financier, relevée sur la pièce papier. Le CF n'a pas de
         compte sur la plateforme, et il n'en aura pas : une clé étrangère
        pointerait vers un agent du SRSP, ce qui serait faux.
       - toute colonne se terminant par `_par` qui est déjà un texte libre
         documenté. */
    const TEXTE_LIBRE = ['signe_par'];
    if (!declaree && !/^(v_|view_)/.test(c.Field) && !TEXTE_LIBRE.includes(c.Field)) {
      sansCle.push(`${t}.${c.Field}`);
    }
  }
}
v('aucune colonne de référence sans clé étrangère', sansCle.length === 0,
  sansCle.join(', ') || 'toutes protégées');

console.log('\n=== 2. DOUBLONS sur clés métier ===');
const DOUBLONS = [
  ['dossiers', 'numero', 'numéro de dossier'],
  ['users', 'email', 'email de compte'],
  ['types_dossiers', 'code', 'code de type'],
  ['divisions', 'code', 'code de division'],
  ['permissions', 'nom', 'nom de permission'],
  ['roles', 'nom', 'nom de rôle'],
  ['statuts_dossiers', 'code', 'code de statut'],
  ['priorites', 'libelle', 'libellé de priorité'],
  ['types_courriers', 'libelle', 'libellé de courrier'],
  ['types_documents', 'libelle', 'libellé de document'],
  ['types_pieces', 'code', 'code de pièce'],
  ['types_pieces_deplacement', 'code', 'code de pièce de déplacement'],
  ['mandatement_pieces', 'code', 'code de pièce de mandatement'],
  ['fonctions', 'libelle', 'libellé de fonction'],
];
for (const [t, col, libelle] of DOUBLONS) {
  if (!tables.includes(t)) { console.log(`  ⚠ ${t} absente`); continue; }
  const r = await db.query(
    `SELECT \`${col}\` AS v, COUNT(*) AS n FROM \`${t}\` GROUP BY \`${col}\` HAVING n > 1`
  );
  v(`${t}.${col} — ${libelle} unique`, r.length === 0,
    r.length ? r.map((x) => `${x.v} ×${x.n}`).join(', ') : '');
}

console.log('\n=== 3. DOUBLONS logiques (même sens métier) ===');
const LOGIQUES = [
  ['agents', 'nom, prenom', 'un agent ne peut avoir deux fiches identiques'],
  ['dossiers', 'demandeur, objet, type_id', 'le même demandeur ne dépose pas deux fois le même objet'],
  ['immatriculations', 'nom, prenom, date_naissance', 'une immatriculation par personne'],
];
for (const [t, cols, regle] of LOGIQUES) {
  if (!tables.includes(t)) continue;
  const r = await db.query(
    `SELECT ${cols}, COUNT(*) AS n FROM \`${t}\` GROUP BY ${cols} HAVING n > 1`
  );
  v(`${t} : ${regle}`, r.length === 0,
    r.length ? r.map((x) => JSON.stringify(x)).join(' | ') : '');
}

console.log('\n=== 4. DONNÉES INCOHÉRENTES (référentiel incomplet) ===');
/* Une ligne dont la division ne correspond pas au type de dossier est un
   défaut de routage : le dossier atterrit chez le mauvais chef. */
/* Un dossier sans division, ou dont la division ne correspond pas au type, est
   invisible de la file de son chef : il avance sans jamais être traité. La
   relation est portée par divisions.type_dossier_id, pas par une table de
   correspondance — la migration 023 a ajouté la colonne, pas créé une table. */
const mauvaisRoutage = await db.query(
  `SELECT d.id, d.numero, t.code AS type_attendu, dv.code AS division_reelle
   FROM dossiers d
   JOIN types_dossiers t ON t.id = d.type_id
   LEFT JOIN divisions dv ON dv.id = d.division_id
   WHERE d.division_id IS NULL OR dv.type_dossier_id <> d.type_id
   LIMIT 10`
);
v('tout dossier est routé vers la division de son type', mauvaisRoutage.length === 0,
  mauvaisRoutage.map((r) => `${r.numero} (${r.type_attendu}) -> ${r.division_reelle ?? 'AUCUNE division'}`).join(', '));

/* Un dossier affecté à un agent d'une autre division : l'agent verrait un
   dossier qui n'est pas le sien, ou n'en verrait pas le sien. */
const affectationCroisee = await db.query(
  `SELECT d.id, d.numero, a.nom, a.division_id AS div_agent, d.division_id AS div_dossier
   FROM dossiers d
   JOIN agents a ON a.id = d.agent_responsable_id
   WHERE d.division_id IS NOT NULL AND a.division_id IS NOT NULL
     AND a.division_id <> d.division_id
   LIMIT 10`
);
v('aucun dossier affecté à un agent d\'autre division', affectationCroisee.length === 0,
  affectationCroisee.map((r) => `${r.numero} → agent ${r.nom} (div ${r.div_agent}) sur dossier div ${r.div_dossier}`).join(', '));

/* Un mandatement sans bénéficiaire : le document l'exige, et un mandat sans
   bénéficiaire ne peut pas être payé. */
const mandatOrphelin = await db.query(
  `SELECT m.id, m.dossier_id FROM mandatements m
   LEFT JOIN mandatement_beneficiaires b ON b.mandatement_id = m.id
   GROUP BY m.id HAVING COUNT(b.id) = 0`
);
v('aucun mandatement sans bénéficiaire', mandatOrphelin.length === 0,
  mandatOrphelin.map((r) => `mandat ${r.id} sur dossier ${r.dossier_id}`).join(', '));

/* Un état d'émargement sans ligne : il ne prouve que personne n'a rien touché,
   ce qui doit se voir à l'écran et non passer inaperçu. */
const emargementVide = await db.query(
  `SELECT e.id FROM etats_emargement e
   LEFT JOIN emargements em ON em.etat_emargement_id = e.id
   GROUP BY e.id HAVING COUNT(em.id) = 0`
);
v('aucun état d\'émargement vide', emargementVide.length === 0,
  emargementVide.map((r) => r.id).join(', '));

console.log('\n=== 5. COHÉRENCE DES COMPTEURS DE NUMÉROTATION ===');
const compteurs = await db.query('SELECT cle, valeur FROM compteurs_numerotation ORDER BY cle');
for (const c of compteurs) {
  if (!c.cle.startsWith('DOSSIER-')) continue;
  const [, typeId, annee] = c.cle.split('-');
  const reel = await db.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(numero, '-', -1) AS UNSIGNED)), 0) AS max
     FROM dossiers WHERE type_id = ? AND numero LIKE ?`,
    [Number(typeId), `%-${annee}-%`]
  );
  const max = Number(reel[0]?.max || 0);
  v(`${c.cle} : compteur ${c.valeur} ≥ maximum réel ${max}`, c.valeur >= max);
}

await db.pool.end();
console.log(ko === 0 ? '\n  TOUT CONFORME' : `\n  ❌ ${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);

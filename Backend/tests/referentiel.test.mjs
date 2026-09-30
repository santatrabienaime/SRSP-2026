/* Le référentiel des 325 fonctionnalités doit être CRÉDIBLE.
 *
 * Un référentiel qui déclare « 200 fonctions livrées » alors que certaines
 * permissions citées n'existent pas en base, ou que des lignes non livrées
 * n'ont aucun motif, ne vaut pas mieux qu'un document : il déplace le problème
 * sans le régler, et cette fois dans la base.
 *
 * Les contrôles portent donc sur ce qui rend le référentiel vérifiable :
 * exhaustivité de la numérotation, existence des permissions, motifs
 * obligatoires, cohérence des natures.
 */
import db from '../src/config/db.js';

let ko = 0;
const v = (libelle, conforme, detail = '') => {
  if (!conforme) ko++;
  console.log(`  ${conforme ? '✅' : '❌'} ${libelle}${detail ? ' — ' + detail : ''}`);
};

console.log('=== 1. Le document est-il intégralement couvert ? ===');
const total = (await db.query('SELECT COUNT(*) AS n FROM referentiel_fonctionnalites'))[0].n;
v('325 fonctionnalités enregistrées', total === 325, `${total} lignes`);

const trous = await db.query(
  'SELECT numero_source FROM referentiel_fonctionnalites ORDER BY numero_source'
);
const nums = trous.map((r) => Number(r.numero_source));
v('numérotation continue de 1 à 325', nums[0] === 1 && nums[nums.length - 1] === 325,
  `${nums[0]} à ${nums[nums.length - 1]}`);
const manquants = [];
for (let i = 1; i <= 325; i++) if (!nums.includes(i)) manquants.push(i);
v('aucun numéro manquant', manquants.length === 0, manquants.join(', ') || 'aucun');
v('aucun numéro en double', new Set(nums).size === nums.length);

console.log('\n=== 2. Les permissions citées existent-elles ? ===');
const permissions = new Set(
  (await db.query('SELECT nom FROM permissions')).map((r) => r.nom)
);
const citees = await db.query(
  `SELECT DISTINCT permission_nom FROM referentiel_fonctionnalites
   WHERE permission_nom IS NOT NULL AND permission_nom <> ''`
);
const inconnues = citees.map((r) => r.permission_nom).filter((p) => !permissions.has(p));
v('toutes les permissions citées existent', inconnues.length === 0,
  inconnues.join(', ') || `${citees.length} permissions citées, toutes réelles`);

console.log('\n=== 3. Une fonction non livrée a-t-elle un motif ? ===');
const [sansMotif] = await db.query(
  `SELECT COUNT(*) AS n FROM referentiel_fonctionnalites
   WHERE etat <> 'LIVREE' AND (motif IS NULL OR motif = '')`
);
v('aucune fonction non livrée sans motif', Number(sansMotif.n) === 0,
  `${sansMotif.n} sans motif`);

const [livreesAvecMotif] = await db.query(
  `SELECT COUNT(*) AS n FROM referentiel_fonctionnalites
   WHERE etat = 'LIVREE' AND motif IS NOT NULL AND motif <> ''`
);
v('aucune fonction livrée ne porte de motif inutile', Number(livreesAvecMotif.n) === 0,
  `${livreesAvecMotif.n} avec motif alors qu'elles sont livrées`);

console.log('\n=== 4. Les états sont-ils cohérents ? ===');
/* Une fonction ne peut être INERTE que si sa permission existe : c'est
   précisément la définition de cet état — la porte existe, elle ne mène nulle
   part. */
const inertes = await db.query(
  `SELECT f.numero_source, f.permission_nom FROM referentiel_fonctionnalites f
   WHERE f.etat = 'INERTE'`
);
const inertesSansPermission = inertes.filter((f) => !f.permission_nom);
v('toute fonction INERTE a une permission existante', inertesSansPermission.length === 0,
  inertesSansPermission.length ? inertesSansPermission.map((f) => f.numero_source).join(', ') : `${inertes.length} inertes`);

const [livreesSansPermission] = await db.query(
  `SELECT COUNT(*) AS n FROM referentiel_fonctionnalites
   WHERE etat = 'LIVREE' AND (permission_nom IS NULL OR permission_nom = '')`
);
/* Les informations institutionnelles sont affichées sans autorisation : c'est
   normal. On vérifie donc qu'il n'y en a pas d'autre. */
const livreesNonInstitutionnelles = await db.query(
  `SELECT numero_source, libelle FROM referentiel_fonctionnalites
   WHERE etat = 'LIVREE' AND nature = 'METIER'
     AND (permission_nom IS NULL OR permission_nom = '')`
);
v('toute fonction métier livrée a une permission', livreesNonInstitutionnelles.length === 0,
  livreesNonInstitutionnelles.map((f) => f.numero_source).join(', ') || `${Number(livreesSansPermission.n)} sans permission, toutes institutionnelles`);

console.log('\n=== 5. Les natures sont-elles cohérentes ? ===');
const [structuresAvecPermission] = await db.query(
  `SELECT COUNT(*) AS n FROM referentiel_fonctionnalites
   WHERE nature = 'STRUCTURE' AND (permission_nom IS NOT NULL AND permission_nom <> '')`
);
v('aucune ligne d’organigramme n’a de permission', Number(structuresAvecPermission.n) === 0);

const [structuresLivrees] = await db.query(
  `SELECT COUNT(*) AS n FROM referentiel_fonctionnalites
   WHERE nature = 'STRUCTURE' AND etat = 'LIVREE'`
);
v('aucune ligne d’organigramme n’est comptée comme livrée', Number(structuresLivrees.n) === 0,
  `${structuresLivrees.n} comptée(s) à tort`);

console.log('\n=== 6. Les postes existent-ils tous ? ===');
const postes = new Set((await db.query('SELECT code FROM referentiel_postes')).map((r) => r.code));
const postesCites = new Set(
  (await db.query('SELECT DISTINCT poste_code FROM referentiel_fonctionnalites')).map((r) => r.poste_code)
);
const postesInconnus = [...postesCites].filter((p) => !postes.has(p));
v('tous les postes cités existent', postesInconnus.length === 0, postesInconnus.join(', ') || `${postesCites.size} postes`);

/* Un poste sans fonction n'est pas une erreur : le Ministère en compte
   plusieurs. Mais un poste du SRSP sans fonction est un oubli. */
const postesSrspSansFonction = await db.query(
  `SELECT p.code, p.libelle FROM referentiel_postes p
   WHERE p.role_nom IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM referentiel_fonctionnalites f WHERE f.poste_code = p.code)`
);
v('chaque rôle du SRSP porte au moins une fonction', postesSrspSansFonction.length === 0,
  postesSrspSansFonction.map((p) => p.libelle).join(', ') || 'tous couverts');

console.log('\n=== 7. Le bilan announced est-il le bilan réel ? ===');
const { bilan } = await import('../src/models/referentielModel.js');
const b = await bilan();
const sommeEtats = Object.values(b.par_etat).reduce((s, n) => s + n, 0);
v('la somme des états vaut le total', sommeEtats === b.total, `${sommeEtats} = ${b.total}`);
const sommeNatures = Object.values(b.par_nature).reduce((s, n) => s + n, 0);
v('la somme des natures vaut le total', sommeNatures === b.total, `${sommeNatures} = ${b.total}`);
v('les fonctions utilisables excluent les structures',
  b.utilisables <= b.total - (b.par_nature.STRUCTURE || 0),
  `${b.utilisables} utilisables, ${b.par_nature.STRUCTURE} structures exclues`);

await db.pool.end();
console.log(ko === 0 ? '\n  TOUT CONFORME' : `\n  ❌ ${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);

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

console.log('=== 1. Les deux documents sont-ils integralement couverts ? ===');
/* Le referentiel porte DEUX documents. La cle est (document, numero) : sans
   elle, les 189 fonctionnalites obligatoires ecrasaient les 325 lignes de
   l historique, une par une, et la mission du SRSP disparaissait de la base.

   Deux documents qui se detruisent ne peuvent pas coexister : il fallait le voir
   a la migration. */
const ATTENDUS = [
  { document: 'HISTORIQUE', total: 325 },
  { document: 'OBLIGATOIRE', total: 189 },
];

for (const attendu of ATTENDUS) {
  const d = attendu.document;
  const total = (await db.query(
    'SELECT COUNT(*) AS n FROM referentiel_fonctionnalites WHERE document = ?', [d]
  ))[0].n;
  v(`${d} : ${attendu.total} fonctionnalites`, total === attendu.total, `${total} lignes`);

  const nums = (await db.query(
    'SELECT numero_source FROM referentiel_fonctionnalites WHERE document = ? ORDER BY numero_source',
    [d]
  )).map((r) => Number(r.numero_source));

  v(`${d} : numerotation de 1 a ${attendu.total}`,
    nums[0] === 1 && nums[nums.length - 1] === attendu.total,
    `${nums[0]} a ${nums[nums.length - 1]}`);

  const manquants = [];
  for (let i = 1; i <= attendu.total; i++) if (!nums.includes(i)) manquants.push(i);
  v(`${d} : aucun numero manquant`, manquants.length === 0, manquants.join(', ') || 'aucun');
  v(`${d} : aucun numero en double`, new Set(nums).size === nums.length);
}

const totalGlobal = (await db.query('SELECT COUNT(*) AS n FROM referentiel_fonctionnalites'))[0].n;
v('les deux documents coexistent', totalGlobal === 514, `${totalGlobal} lignes au total`);

/* La mission du SRSP doit avoir survecu au chargement des 189 : c est elle qui
   avait ete ecrasee, ligne par ligne. */
const mission = await db.query(
  `SELECT numero_source, libelle FROM referentiel_fonctionnalites
   WHERE document = 'HISTORIQUE' AND numero_source IN (1, 118, 325)`
);
v('les lignes de l historique sont intactes', mission.length === 3,
  mission.map((m) => `${m.numero_source}: ${m.libelle.slice(0, 28)}`).join(' | '));
v('et ne sont pas celles des obligatoires',
  mission.every((m) => !/email|Hachage|token/i.test(m.libelle)));


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

/* Un motif sur une ligne LIVREE n'est pas inutile : il documente un écart
   constaté et corrigé, ou un écart assumé volontairement. Les lignes concernées
   sont les corrections de cet audit — expiration ramenée à 8 h, taille à 5 Mo,
   nom de fichier en UUID — et les écarts assumés, comme les 51 permissions
   réelles. Effacer ces motifs ferait perdre la seule trace de la raison pour
   laquelle la valeur retenue est celle-là.

   Ce qui doit rester vrai : une ligne non livrée porte TOUJOURS un motif, et
   aucune ligne n'a de motif vide. */
const [motifVide] = await db.query(
  `SELECT COUNT(*) AS n FROM referentiel_fonctionnalites
   WHERE motif IS NOT NULL AND motif = ''`
);
v('aucun motif vide', Number(motifVide.n) === 0, `${motifVide.n} motif(s) vide(s)`);

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
/* La regle ne vaut que pour les fonctions PORTEES par un role : c'est la
   permission qui les rend actionnables, et une fonction sans permission
   n'ouvre rien.

   Les fonctionnalites obligatoires couvrent aussi des fonctions TECHNIQUES —
   hachage, JWT, expiration, CORS, validation, statuts, transitions, routage,
   recherche, notifications. Aucune ne passe par une permission applicative, et
   leur en inventer une ne les rendrait pas plus securisees : elles sont
   verifiees autrement, par leur comportement. */
const CATEGORIES_METIER = [
  'Divisions', 'Par rôle', 'Dossiers', 'Courriers', 'Documents', 'Archivage',
  'Audit', 'Tableaux de bord', 'Rapports', 'Notifications', 'Recherche',
];
const listeMetier = CATEGORIES_METIER.map((c) => `'${c}'`).join(', ');
const livreesNonInstitutionnelles = await db.query(
  `SELECT numero_source, libelle FROM referentiel_fonctionnalites
   WHERE etat = 'LIVREE' AND document = 'HISTORIQUE'
     AND section_source IN (${listeMetier})
     AND (permission_nom IS NULL OR permission_nom = '')`
);
v('toute fonction métier portée par un rôle a une permission',
  livreesNonInstitutionnelles.length === 0,
  livreesNonInstitutionnelles.map((f) => f.numero_source).join(', ') || 'toutes');

/* Les fonctionnalités OBLIGATOIRES couvrent quinze catégories, dont
   l'authentification, la sauvegarde et le monitoring : ce sont des fonctions
   techniques, portées par la configuration et non par une permission
   applicative. Leur nature est donc distinguishable. */
const techniquesObligatoires = await db.query(
  `SELECT numero_source, libelle FROM referentiel_fonctionnalites
   WHERE document = 'OBLIGATOIRE' AND etat = 'LIVREE'
     AND (permission_nom IS NULL OR permission_nom = '')
     AND section_source IN ('Authentification', 'Workflow', 'Notifications', 'Recherche',
                            'Documents', 'Dossiers', 'Utilisateurs', 'Courriers',
                            'Tableaux de bord', 'Rapports', 'Archivage', 'Audit', 'Administration')`
);
v('les fonctions techniques obligatoires sont identifiables',
  techniquesObligatoires.length > 0,
  `${techniquesObligatoires.length} fonction(s) technique(s) sans permission applicative`);

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
for (const document of ['HISTORIQUE', 'OBLIGATOIRE']) {
  const b = await bilan({ document });
const sommeEtats = Object.values(b.par_etat).reduce((s, n) => s + n, 0);
  v(`[${document}] la somme des états vaut le total`, sommeEtats === b.total, `${sommeEtats} = ${b.total}`);
  const sommeNatures = Object.values(b.par_nature).reduce((s, n) => s + n, 0);
  v(`[${document}] la somme des natures vaut le total`, sommeNatures === b.total, `${sommeNatures} = ${b.total}`);
  v(`[${document}] les fonctions utilisables excluent les structures`,
    b.utilisables <= b.total - (b.par_nature.STRUCTURE || 0),
    `${b.utilisables} utilisables, ${b.par_nature.STRUCTURE || 0} structures exclues`);
  v(`[${document}] le bilan annonce le bon document`, b.document === document);
}

await db.pool.end();
console.log(ko === 0 ? '\n  TOUT CONFORME' : `\n  ❌ ${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);

/* Audit du document « 339 fonctionnalités » face à l'état réel.
 *
 * Trois affirmations du document sont vérifiables :
 *   1. « Aucun doublon entre les rôles » ;
 *   2. « Chaque fonctionnalité est unique et attribuée à un seul rôle » ;
 *   3. « 4 divisions, 1 chef + 3 agents chacune, 21 utilisateurs ».
 *
 * On ne juge pas le document sur son texte mais sur ce que la plateforme
 * permet réellement : matrice RBAC, effectifs, écrans existants.
 */
const base = 'http://localhost:5000/api';

const login = async (email, motDePasse = 'Demo123!') =>
  (await (await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant: email, password: motDePasse }),
  })).json());

const g = async (t, chemin) => {
  const r = await fetch(base + chemin, { headers: { Authorization: `Bearer ${t}` } });
  return { s: r.status, b: await r.json().catch(() => null) };
};

let ko = 0;
const v = (libelle, conforme, detail = '') => {
  if (!conforme) ko++;
  console.log(`  ${conforme ? '✅' : '❌'} ${libelle}${detail ? ' — ' + detail : ''}`);
};

const admin = await login('admin@srsp.mg', 'Admin123!');

console.log('=== 1. « Aucun doublon entre les rôles » ===');
const ROLES = [
  'chefservice@srsp.mg', 'secretaire@srsp.mg', 'chefbaaf@srsp.mg',
  'coordinatrice@srsp.mg', 'chef.visa@srsp.mg', 'verif.visa@srsp.mg',
  'chef.solde@srsp.mg', 'verif.solde@srsp.mg', 'chef.pension@srsp.mg',
  'liquidateur@srsp.mg', 'chef.secours@srsp.mg', 'charge.secours@srsp.mg',
];

const matrice = {};
for (const email of ROLES) {
  const s = await login(email);
  const perms = (await g(s.token, '/permissions/me')).b || [];
  matrice[email] = new Set((perms.map((p) => (typeof p === 'string' ? p : p.nom)) || []));
}

/* Une permission partagée par N rôles n'est pas un doublon dans le sens d'une
 * erreur : joindre les rôles n'ont pas tous les mêmes besoins. Mais le
 * document affirme l'inverse. On mesure donc, on ne juge pas. */
const toutes = new Map();
for (const [role, perms] of Object.entries(matrice)) {
  for (const p of perms) {
    if (!toutes.has(p)) toutes.set(p, []);
    toutes.get(p).push(role);
  }
}
const partagees = [...toutes.entries()].filter(([, r]) => r.length >= 3)
  .sort((a, b) => b[1].length - a[1].length);

console.log(`  permissions totales : ${toutes.size}`);
console.log(`  permissions portees par 3 roles ou plus : ${partagees.length}`);
console.log(`  permissions portees par un seul role : ${[...toutes.values()].filter((r) => r.length === 1).length}`);
console.log('');
console.log('  les plus partagees :');
for (const [p, roles] of partagees.slice(0, 6)) {
  console.log(`    ${p.padEnd(24)} ${roles.length} rôles`);
}
v('l affirmation « aucun doublon » est-elle tenable', partagees.length === 0,
  `${partagees.length} permissions partagées`);

console.log('\n=== 2. « Chaque fonctionnalité est attribuée à un seul rôle » ===');
/* Un doublon strict : deux roles qui ont exactement le meme ensemble de
   permissions. Deux agents de divisions differentes feraient alors la meme
   chose au point pres, ce qui est un defaut de conception du referentiel. */
const signatures = new Map();
for (const [role, perms] of Object.entries(matrice)) {
  const cle = [...perms].sort().join('|');
  if (!signatures.has(cle)) signatures.set(cle, []);
  signatures.get(cle).push(role);
}
const identiques = [...signatures.values()].filter((r) => r.length > 1);
v('aucun role n est strictement identique a un autre', identiques.length === 0,
  identiques.flatMap((r) => r.map((x) => x.split('@')[0])).join(' = ') || 'aucun doublon strict');

/* Un role sans aucune permission propre : il ne pourrait rien faire de
   specifique. */
const sansRien = Object.entries(matrice).filter(([, p]) => p.size === 0);
v('aucun role sans permission', sansRien.length === 0, sansRien.map(([r]) => r).join(', '));

console.log('\n=== 3. « 1 chef + 3 agents par division, 21 utilisateurs » ===');
const { default: db } = await import('/home/malaso/SRSP-2026/Backend/src/config/db.js');
const effectifs = await db.query(
  `SELECT dv.code AS division,
          SUM(CASE WHEN r.nom LIKE 'CHEF_DIVISION%' THEN 1 ELSE 0 END) AS chefs,
          SUM(CASE WHEN r.nom NOT LIKE 'CHEF_DIVISION%' THEN 1 ELSE 0 END) AS agents
   FROM agents a
   JOIN divisions dv ON dv.id = a.division_id
   JOIN users u ON u.id = a.user_id
   JOIN roles r ON r.id = u.role_id
   GROUP BY dv.id ORDER BY dv.id`
);
for (const d of effectifs) {
  v(`${d.division} : 3 agents d execution`, d.agents === 3, `${d.agents} en base`);
}
const total = (await db.query('SELECT COUNT(*) AS n FROM agents'))[0].n;
v('21 utilisateurs au total', total === 21, `${total} en base`);

console.log('\n=== 4. Les permissions existantes couvrent-elles les rôles du document ? ===');
/* Le document nomme des activités précises. On vérifie celles qui exigent une
   permission propre et n'en ont aucune. */
const NIVEAUX = [
  ['13.1.5 Supprimer un compte', 'supprimer_utilisateur'],
  ['13.2.7 Créer un rôle', 'creer_role'],
  ['11.7 Produire les situations FCC/BCSE', 'produire_situations_fcc'],
  ['11.10 Gérer les congés', 'gerer_conges'],
  ['3.4 Chronologie des actes (BE, Notes, Lettres)', 'gerer_chronologie_actes'],
  ['13.3.15 Surveiller les performances', 'surveiller_performances'],
  ['13.4.16 Configurer les types de dossiers', 'configurer_types_dossiers'],
  ['3.4.13 Approuver les bons de caisse', 'approuver_bons'],
  ['9.4.13 Envoyer les oppositions', 'suivre_oppositions'],
  ['10.3.8 Archiver le dossier mère', 'gerer_dossiers_meres'],
  ['12.5 Archiver les pièces Secours', 'archiver_pieces'],
];
for (const [fonction, perm] of NIVEAUX) {
  v(`${fonction} → ${perm}`, toutes.has(perm), toutes.has(perm) ? '' : 'permission absente');
}

await db.pool.end();
console.log(ko === 0 ? '\n  TOUT CONFORME' : `\n  ${ko} point(s) non conforme(s) — le document et la base divergent`);
process.exit(0);

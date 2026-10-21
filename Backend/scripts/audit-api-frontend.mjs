/**
 * Audit croisé : ce que le frontend appelle, ce que le backend expose.
 *
 * L'inventaire des fonctionnalités se fait par les **écrans** : un écran qui
 * appelle une route inexistante est une fonctionnalité manquante, et
 * l'agent la découvre en plein travail. Une route que rien n'appelle est
 * l'inverse : une fonctionnalité qui existe mais reste invisible.
 *
 * Les deux listes se répondent. C'est le seul relevé qui dise ce qui
 * manque vraiment.
 */
import fs from 'node:fs';
import path from 'node:path';

const RACINE = path.resolve('..');
const SRC_BACKEND = path.join(RACINE, 'Backend', 'src');
const SRC_FRONTEND = path.join(RACINE, 'Frontend', 'src');

/* ── 1. Les routes du backend ─────────────────────────────────────────── */

/* Les montages de app.js : `app.use('/api/dossiers', dossierRoutes)`. */
const appSource = fs.readFileSync(path.join(SRC_BACKEND, 'app.js'), 'utf8');
const montages = new Map();
for (const m of appSource.matchAll(/app\.use\(\s*'(\/api[^']*)'\s*,\s*(\w+)\s*\)/g)) {
  montages.set(m[2], m[1]);
}

const routes = [];
for (const fichier of fs.readdirSync(path.join(SRC_BACKEND, 'routes'))) {
  if (!fichier.endsWith('.js')) continue;
  const nomRoute = fichier.replace(/\.js$/, '');
  const prefixe = montages.get(nomRoute);
  if (!prefixe) continue;

  const source = fs.readFileSync(path.join(SRC_BACKEND, 'routes', fichier), 'utf8');
  for (const m of source.matchAll(/router\.(get|post|put|patch|delete)\(\s*'([^']*)'/g)) {
    routes.push({
      methode: m[1].toUpperCase(),
      chemin: `${prefixe}${m[2]}`.replace(/\/+$/, '') || prefixe,
      fichier: nomRoute,
    });
  }
}

/* ── 2. Les appels du frontend ────────────────────────────────────────── */

/* Les services appellent `apiClient.get('/chemin')`. Deux formes coexistent :
   un chemin littéral, et un chemin construit à partir d'une constante
   (`const base = '/archives'` puis `` `${base}/${id}` ``). Les deux doivent
   être résolus, sinon les routes construites semblent orphelines. */
const appels = [];
function analyserService(fichier, source) {
  /* Les constantes déclarées dans le fichier : ce sont les bases des
     chemins construits. */
  const bases = new Map();
  for (const m of source.matchAll(/const\s+(\w+)\s*=\s*['"]([^'"]+)['"]/g)) {
    bases.set(m[1], m[2]);
  }

  /* L'appel peut être formaté sur plusieurs lignes — `apiClient\n  .get(...)`
     est la forme la plus fréquente dans les services. On laisse donc le
     blanc libre entre l'objet et la méthode, et entre la méthode et son
     argument. Sans cela, la moitié des routes apparaît orpheline. */
  for (const m of source.matchAll(
    /apiClient\s*\.\s*(get|post|put|patch|delete)\s*\(\s*(?:[`'"]([^`'"]+)[`'"]|(\w+))/g
  )) {
    /* L'argument peut être un chemin littéral, un gabarit, ou le simple nom
       d'une constante (`apiClient.get(base, …)`). */
    const brut = m[2] ?? m[3];
    let chemin = brut;
    if (bases.has(brut)) chemin = bases.get(brut);
    for (const [nom, valeur] of bases) {
      chemin = chemin.split('${' + nom + '}').join(valeur);
    }
    chemin = chemin.replace(/\$\{[^}]+\}/g, ':id');
    appels.push({
      methode: m[1].toUpperCase(),
      chemin,
      brut,
      fichier,
    });
  }
}

function parcourir(dossier) {
  for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
    const complet = path.join(dossier, entree.name);
    if (entree.isDirectory()) { parcourir(complet); continue; }
    if (!/\.(js|jsx)$/.test(entree.name)) continue;
    if (/\.test\.jsx?$/.test(entree.name)) continue;
    analyserService(
      path.relative(SRC_FRONTEND, complet).replace(/\\/g, '/'),
      fs.readFileSync(complet, 'utf8')
    );
  }
}
parcourir(SRC_FRONTEND);

/* ── 3. La comparaison ────────────────────────────────────────────────── */

/* Une route `/dossiers/:id/documents` répond à l'appel `/dossiers/12/documents`.
   Le backend est monté sous `/api` ; le frontend l'omet — on retire donc le
   préfixe de comparaison. */
function routeCorrespond(route, appel) {
  const cheminRoute = route.chemin.replace(/^\/api/, '');
  const morceauxRoute = cheminRoute.split('/');
  const morceauxAppel = appel.chemin.split('/');
  if (morceauxRoute.length !== morceauxAppel.length) return false;
  /* Un segment joker des deux côtés : l'appel `/archives/export/${format}`
     désigne `/archives/export/csv` comme `/archives/export/excel`. */
  return morceauxRoute.every((m, i) => (
    m.startsWith(':') || morceauxAppel[i].startsWith(':') || m === morceauxAppel[i]
  ));
}

const routesOrphelines = routes.filter((r) => !appels.some((a) => routeCorrespond(r, a)));
const appelsSansRoute = appels.filter((a) => !routes.some((r) => routeCorrespond(r, a)));

/* ── 4. Le rapport ─────────────────────────────────────────────────────── */

console.log(`Routes backend   : ${routes.length}`);
console.log(`Appels frontend  : ${appels.length}\n`);

console.log('=== Appels du frontend sans route backend ===');
if (appelsSansRoute.length === 0) {
  console.log('  aucun.\n');
} else {
  for (const a of appelsSansRoute) {
    console.log(`  ${a.methode.padEnd(6)} ${a.chemin.padEnd(48)} ${a.fichier}`);
  }
  console.log('');
}

console.log('=== Routes backend jamais appelées par le frontend ===');
if (routesOrphelines.length === 0) {
  console.log('  aucune.\n');
} else {
  /* On regroupe par fichier : une route d'un module jamaisbranché se voit
     d'un coup d'œil. */
  const parFichier = new Map();
  for (const r of routesOrphelines) {
    if (!parFichier.has(r.fichier)) parFichier.set(r.fichier, []);
    parFichier.get(r.fichier).push(r);
  }
  for (const [fichier, liste] of [...parFichier.entries()].sort()) {
    console.log(`  ${fichier} :`);
    for (const r of liste) console.log(`    ${r.methode.padEnd(6)} ${r.chemin}`);
  }
  console.log('');
}

/* Les deux listes sont des défauts, pas des observations :
   - un appel sans route est une fonctionnalité cassée, que l'agent découvre
     en plein travail ;
   - une route orpheline est une capacité qui existe mais reste invisible —
     c'est de la fonctionnalité perdue. */
if (appelsSansRoute.length === 0 && routesOrphelines.length === 0) {
  console.log('✅ L\'API est entièrement couverte : chaque route a son écran, chaque écran a sa route.');
  process.exit(0);
}

console.log('❌ L\'API n\'est pas entièrement couverte.');
process.exit(1);

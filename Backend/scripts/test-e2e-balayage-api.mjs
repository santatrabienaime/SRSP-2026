/**
 * Balayage de tous les points d'entrée en lecture, avec tous les profils.
 *
 * Les campagnes précédentes vérifient un *circuit* : le VISA de bout en
 * bout, la réinitialisation, le temps réel. Elles ne vérifient pas que
 * *chaque* écran a bien la donnée qu'il attend. Il en a résulté qu'une
 * requête du tableau de bord a pu référencer un alias de table absent
 * pendant des semaines : elle ne plantait que pour le profil qui la
 * déclenchait, et l'écran affichait « Impossible de charger ».
 *
 * Ce script appelle donc **tous** les endpoints GET, avec **tous** les
 * rôles, et signale toute erreur serveur. Un point d'entrée qui plante
 * pour un seul profil est un point d'entrée cassé.
 *
 * Les endpoints paramétrés sont appelés avec un identifiant réel quand on
 * peut : une requête qui ne marche qu'avec un identifiant valide n'est pas
 * une requête qui marche.
 */

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const db = (await import('../src/config/db.js')).default;

/* Les points d'entrée à tester, avec leur préfixe de montage.
   La liste est écrite à la main : elle est courte, elle est lisible, et
   elle reste vérifiable à l'œil — un balayage automatique qui lirait les
   fichiers de routes ne verrait pas les routes montées conditionnellement. */
const MONTAGES = {
  authRoutes: '/auth',
  roleRoutes: '/roles',
  permissionRoutes: '/permissions',
  geographieRoutes: '/geographie',
  referentielRoutes: '/referentiel',
  dossierRoutes: '/dossiers',
  workflowRoutes: '/workflow',
  courrierRoutes: '/courriers',
  divisionRoutes: '/divisions',
  agentRoutes: '/agents',
  personnelRoutes: '/personnel',
  notificationRoutes: '/notifications',
  historiqueRoutes: '/historique',
  dashboardRoutes: '/dashboard',
  statistiqueRoutes: '/statistiques',
  performanceRoutes: '/performance',
  commentaireRoutes: '/dossiers',
  rapportRoutes: '/rapports',
  depouillementRoutes: '/dossiers',
  mandatementRoutes: '/dossiers',
  secoursRoutes: '/dossiers',
  correspondanceRoutes: '/correspondances',
  archiveRoutes: '/archives',
  bordereauRoutes: '/bordereaux',
  documentRoutes: '/dossiers',
  reinitialisationRoutes: '/reinitialisations',
  operationRoutes: '/dossiers',
  immatriculationRoutes: '/immatriculations',
};

/* Les endpoints à ne pas appeler : ils déclenchent une action de côté
   (sauvegarde, restauration, génération d'un fichier volumineux). */
const EXCLUS = [
  '/admin/backup/creer',
  '/admin/backup/restaurer',
  '/admin/backup/telecharger',
  '/admin/system/reindexer',
  '/admin/system/optimiser',
];

const COMPTES = [
  ['admin', 'Admin123!'],
  ['secretaire', 'Demo123!'],
  ['chef.visa', 'Demo123!'],
  ['verif.visa', 'Demo123!'],
  ['chef.solde', 'Demo123!'],
  ['verif.solde', 'Demo123!'],
  ['chef.pension', 'Demo123!'],
  ['liquidateur', 'Demo123!'],
  ['chef.secours', 'Demo123!'],
  ['charge.secours', 'Demo123!'],
  ['coordinatrice', 'Demo123!'],
  ['chef.baaf', 'Demo123!'],
  ['chef.service', 'Demo123!'],
];

/* Un identifiant réel pour les routes paramétrées : un dossier, un agent,
   une division, un mandatement. On les prend dans la base — une requête
   testée avec un identifiant fantôme ne prouve rien. */
async function identifiantsReels() {
  const [dossier] = await db.query('SELECT id FROM dossiers ORDER BY id LIMIT 1');
  const [agent] = await db.query('SELECT id FROM agents ORDER BY id LIMIT 1');
  const [division] = await db.query('SELECT id FROM divisions ORDER BY id LIMIT 1');
  const [mandatement] = await db.query('SELECT id FROM mandatements ORDER BY id LIMIT 1');
  const [immatriculation] = await db.query('SELECT id FROM immatriculations ORDER BY id LIMIT 1');
  const [courrier] = await db.query('SELECT id FROM courriers ORDER BY id LIMIT 1');
  return {
    id: dossier?.id ?? 1,
    dossierId: dossier?.id ?? 1,
    agentId: agent?.id ?? 1,
    divisionId: division?.id ?? 1,
    mandatementId: mandatement?.id ?? 1,
    immatriculationId: immatriculation?.id ?? 1,
    courrierId: courrier?.id ?? 1,
    champId: 'matricule',
    typeId: dossier?.type_id ?? 1,
    userId: 1,
    roleId: 1,
    pieceId: 1,
    bordereauId: 1,
    documentId: 1,
    code: 'X',
    idPiece: 1,
  };
}

/* Les routes GET extraites des fichiers de routes. */
const routes = [];
for (const [fichier, prefixe] of Object.entries(MONTAGES)) {
  const source = await import(`node:fs`).then((fs) =>
    fs.readFileSync(`src/routes/${fichier}.js`, 'utf8'));
  const motif = /router\.(?:get|use)\(\s*'([^']+)'/g;
  let m;
  while ((m = motif.exec(source)) !== null) {
    const chemin = `${prefixe}${m[1]}`.replace(/\/$/, '') || prefixe;
    if (!m[1].includes(':') && !m[1].startsWith('/')) continue;
    routes.push({ fichier, chemin });
  }
}

const reels = await identifiantsReels();

/* On ne teste que les routes à paramètre résolu par un identifiant réel. */
const endpoints = routes
  .map((r) => ({
    ...r,
    resolu: r.chemin
      .replace(/:(\w+)/g, (tout, nom) => reels[nom] ?? reels.id)
      .replace(/\/$/, ''),
  }))
  .filter((r) => !EXCLUS.some((e) => r.resolu.includes(e)));

async function login(identifiant, motDePasse) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password: motDePasse }),
  });
  return (await r.json()).token;
}

console.log(`Balayage de ${endpoints.length} point(s) d'entrée, ${COMPTES.length} profils.\n`);

const pannes = new Map();
let appels = 0;

for (const [identifiant, motDePasse] of COMPTES) {
  const token = await login(identifiant, motDePasse);
  for (const endpoint of endpoints) {
    const r = await fetch(`${BASE}${endpoint.resolu}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    appels += 1;
    if (r.status >= 500) {
      const texte = await r.text();
      let message = texte;
      try { message = JSON.parse(texte).message || texte; } catch { /* texte brut */ }
      const cle = `${endpoint.chemin} → ${r.status} ${String(message).slice(0, 140)}`;
      if (!pannes.has(cle)) pannes.set(cle, []);
      pannes.get(cle).push(identifiant);
    }
  }
}

if (pannes.size === 0) {
  console.log(`✅ ${appels} appels, aucune erreur serveur.`);
  process.exit(0);
}

console.log(`❌ ${appels} appels, ${pannes.size} point(s) d'entrée en erreur :\n`);
for (const [cle, profils] of pannes) {
  console.log(`  ${cle}`);
  console.log(`      profils : ${profils.join(', ')}`);
}
process.exit(1);

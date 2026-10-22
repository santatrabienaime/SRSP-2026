/**
 * Les droits et les routes : le contrôle de cohérence.
 *
 * Une permission exigee par une route et portee par AUCUN role rend la
 * route fermée : le serveur repond 403 a tout le monde. L'agent voit un
 * ecran ou les cinq etapes du mandat ne s'executent pas, et personne ne
 * sait pourquoi. C'est ce qui est arrive aux cinq droits du circuit
 * Secours, longtemps sans que rien ne le signale.
 *
 * Ce controle est donc **bloquant**. Il ne verifie pas ce que l'application
 * fait, mais ce qu'elle rend possible.
 *
 * Les trois autres rapports ne bloquent pas, parce qu'ils appellent un
 * arbitrage du SRSP et non une correction de code :
 *
 *   - un droit porte par un role mais utilise nulle part est un droit
 *     **inerte** ;
 *   - une attribution attendue par le registre et non satisfaite ;
 *   - une entree du registre dont l'etat repose sur un droit inerte.
 *
 * Usage : node scripts/test-e2e-droits.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import db from '../src/config/db.js';

let ok = 0;
let ko = 0;
const check = (nom, cond, detail = '') => {
  if (cond) { ok += 1; console.log(`  OK   ${nom}${detail ? ` — ${detail}` : ''}`); }
  else { ko += 1; console.error(`  ECHEC ${nom}${detail ? ` — ${detail}` : ''}`); }
};

console.log('\n=== Droits et routes : cohérence ===\n');

/* ── 1. Les permissions exigées par les routes ────────────────────────── */

const DOSSIER_ROUTES = path.resolve('src/routes');
const exigences = new Map();

for (const fichier of fs.readdirSync(DOSSIER_ROUTES)) {
  if (!fichier.endsWith('.js')) continue;
  const source = fs.readFileSync(path.join(DOSSIER_ROUTES, fichier), 'utf8');

  for (const m of source.matchAll(
    /router\.(get|post|put|patch|delete)\(\s*'([^']*)'([\s\S]{0,500}?)\)\s*;/g
  )) {
    const [, methode, chemin, bloc] = m;
    for (const p of bloc.matchAll(/rbacMiddleware\(([^)]*)\)/g)) {
      for (const nom of p[1].matchAll(/'([a-z_]+)'/gi)) {
        const permission = nom[1];
        if (!exigences.has(permission)) exigences.set(permission, []);
        exigences.get(permission).push({
          fichier: fichier.replace('.js', ''),
          methode: methode.toUpperCase(),
          chemin,
        });
      }
    }
  }
}

/* ── 2. Les droits et leurs porteurs ──────────────────────────────────── */

const permissions = await db.query('SELECT id, nom FROM permissions');
const parPermission = new Map(permissions.map((p) => [p.nom, p.id]));

const portees = await db.query(
  `SELECT p.nom AS permission, GROUP_CONCAT(r.nom ORDER BY r.nom) AS roles
   FROM permissions p
   LEFT JOIN role_permissions rp ON p.id = rp.permission_id
   LEFT JOIN roles r ON r.id = rp.role_id
   GROUP BY p.nom`
);
const porteurs = new Map(portees.map((p) => [p.permission, p.roles]));

console.log(`Permissions exigées par une route : ${exigences.size}`);
console.log(`Permissions déclarées en base       : ${permissions.length}\n`);

/* ── 3. Le contrôle bloquant : une route fermée à tout le monde ───────── */

const fermees = [];
for (const [permission, routes] of exigences) {
  const roles = porteurs.get(permission);
  if (!roles) {
    fermees.push({ permission, routes, raison: 'la permission n’existe pas' });
  } else if (!roles) {
    fermees.push({ permission, routes, raison: 'portée par aucun rôle' });
  }
}

check(
  'Aucune route n’est fermée à tout le monde',
  fermees.length === 0,
  fermees.length
    ? `${fermees.length} permission(s) sans porteur`
    : `${exigences.size} permission(s) routées, toutes portées`
);

for (const f of fermees) {
  console.error(`      ✗ ${f.permission} — ${f.raison}`);
  for (const r of f.routes) {
    console.error(`          ${r.methode.padEnd(6)} ${r.fichier} ${r.chemin}`);
  }
}

/* ── 4. Les droits réellement inertes ─────────────────────────────────── */

/* Un droit n'est inerte que s'il n'apparaît **nulle part** : pas dans une
   route, pas dans un contrôleur, pas dans un service. `view_journal` et
   `view_assigned_dossiers` ne gardent aucune route, mais ils servent de
   discriminateurs de périmètre : les déclarer morts serait un faux positif. */
const UTILISATEURS = ['src', '../Frontend/src'];
const occurrences = new Map();

for (const racine of UTILISATEURS) {
  const base = path.resolve(racine);
  const parcourir = (dossier) => {
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
      const complet = path.join(dossier, entree.name);
      if (entree.isDirectory()) { parcourir(complet); continue; }
      if (!/\.(js|jsx)$/.test(entree.name)) continue;
      const source = fs.readFileSync(complet, 'utf8');
      for (const p of parPermission.keys()) {
        /* On ne compte que les usages « vivants » : une occurrence dans un
           commentaire ou dans une liste d'affichage ne rend pas le droit
           opérant. */
        const motif = new RegExp(`['"\`]${p}['"\`]`);
        if (motif.test(source)) {
          occurrences.set(p, (occurrences.get(p) || 0) + 1);
        }
      }
    }
  };
  parcourir(base);
}

const exigees = new Set(exigences.keys());
const inertes = [...porteurs.keys()]
  .filter((nom) => !exigees.has(nom) && (occurrences.get(nom) || 0) === 0);

console.log(`\nDroits portés par un rôle et utilisés nulle part : ${inertes.length}`);
for (const nom of inertes.sort()) {
  console.log(`  · ${nom} (${porteurs.get(nom)})`);
}

/* ── 5. Le registre ───────────────────────────────────────────────────── */

/* Le registre parle de **postes** ; l'application parle de **rôles**. La
   correspondance est dans `referentiel_postes.role_nom`. Comparer les deux
   vocabulaires directement produit des faux positifs. */
const postes = await db.query(
  `SELECT code, role_nom FROM referentiel_postes
   WHERE role_nom IS NOT NULL AND role_nom <> ''`
);
const roleDuPoste = new Map(postes.map((p) => [p.code, p.role_nom]));

const droitsParRole = new Map();
for (const p of portees) {
  if (!p.roles) continue;
  for (const role of p.roles.split(',')) {
    if (!droitsParRole.has(role)) droitsParRole.set(role, new Set());
    droitsParRole.get(role).add(p.permission);
  }
}

/* Une attribution attendue et non satisfaite n'est pas forcément un
   oubli : le registre porte le vocabulaire du cahier, et la plateforme peut
   avoir choisi autrement — pour une raison écrite dans le code. */
const EXCEPTIONS_DOCUMENTEES = {
  'traiter_dossier': 'Les chefs de division ne portent pas ce droit : '
    + 'l’affectation automatique ne propose un dossier qu’aux agents qui le '
    + 'portent, et l’accorder aux chefs les chargerait du traitement '
    + 'qu’ils n’ont pas à faire (affectationAutoService).',
};

const registre = await db.query(
  `SELECT f.document, f.numero_source, f.poste_code, f.etat, f.libelle,
          f.permission_nom, f.motif
   FROM referentiel_fonctionnalites f
   WHERE f.permission_nom IS NOT NULL AND f.permission_nom <> ''
   ORDER BY f.document, f.numero_source`
);

const inexistantes = registre.filter((e) => !parPermission.has(e.permission_nom));
check(
  'Le registre ne cite aucune permission inexistante',
  inexistantes.length === 0,
  inexistantes.length
    ? inexistantes.map((e) => `${e.document}/${e.numero_source} → ${e.permission_nom}`).join(', ')
    : `${registre.length} entrées vérifiées`
);

const nonSatisfaites = new Map();
for (const e of registre) {
  if (e.etat !== 'LIVREE' && e.etat !== 'PARTIELLE') continue;
  const role = roleDuPoste.get(e.poste_code);
  if (!role) continue;
  const droits = droitsParRole.get(role);
  if (!droits || droits.has(e.permission_nom)) continue;
  if (!nonSatisfaites.has(e.permission_nom)) {
    nonSatisfaites.set(e.permission_nom, { role, entrees: [] });
  }
  nonSatisfaites.get(e.permission_nom).entrees.push(e);
}

const aArbitrer = [...nonSatisfaites.entries()].filter(([nom]) => !EXCEPTIONS_DOCUMENTEES[nom]);
console.log(`\nAttributions attendues par le registre et non satisfaites : ${aArbitrer.length}`);
for (const [permission, detail] of aArbitrer) {
  console.log(`  · ${permission} — attendu par ${detail.role} (${detail.entrees.length} exigence(s))`);
}
for (const [nom, raison] of Object.entries(EXCEPTIONS_DOCUMENTEES)) {
  console.log(`  = ${nom} — écart assumé : ${raison}`);
}

/* Les entrées dont l'état repose sur un droit inerte : le registre les
   appelle « inertes » lui-même, et leur état mérite d'être arbitré. */
const surInertes = registre.filter((e) => inertes.includes(e.permission_nom));
console.log(`\nEntrées du registre dont l’état repose sur un droit inerte : ${surInertes.length}`);
for (const e of surInertes.slice(0, 6)) {
  console.log(`  · ${e.document}/${e.numero_source} [${e.etat}] ${e.libelle}`);
}
if (surInertes.length > 6) console.log(`    … et ${surInertes.length - 6} autre(s)`);

console.log(`\nRésultat : ${ok} vérification(s) réussie(s), ${ko} échec(s).`);
process.exit(ko === 0 ? 0 : 1);

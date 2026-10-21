/**
 * Vérifie que les exports Excel portent des noms d'onglets valides.
 *
 * Excel refuse un nom d'onglet de plus de 31 caractères. La bibliothèque
 * tronque en silence, au milieu d'un mot : le fichier s'ouvre, mais l'onglet
 * est illisible. Ce script relit les fichiers produits et vérifie les noms.
 */

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const ExcelJS = (await import('exceljs')).default;

let ok = 0;
let ko = 0;
const check = (nom, cond, detail = '') => {
  if (cond) { ok += 1; console.log(`  OK   ${nom}${detail ? ` — ${detail}` : ''}`); }
  else { ko += 1; console.error(`  ECHEC ${nom}${detail ? ` — ${detail}` : ''}`); }
};

async function login(identifiant, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password }),
  });
  return (await r.json()).token;
}

const token = await login('admin', 'Admin123!');

const EXPORTS = [
  '/rapports/journalier-recus/excel',
  '/rapports/dossiers-periode/excel',
  '/rapports/attente-transmission/excel',
  '/rapports/incomplets/excel',
  '/rapports/retournes/excel',
  '/rapports/transmissions-division/excel',
  '/rapports/registre-courriers/excel',
  '/rapports/clotures/excel',
  '/rapports/archives/excel',
  '/rapports/stats-type-periode-division/excel',
  '/rapports/visa/excel',
  '/rapports/visa-par-verificateur/excel',
  '/rapports/operations/excel',
  '/rapports/operations-par-type/excel',
  '/rapports/secours/excel',
];

console.log('\n=== Noms d\'onglets des exports Excel ===\n');

for (const chemin of EXPORTS) {
  const r = await fetch(`${BASE}${chemin}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (r.status !== 200) {
    check(`${chemin} : export accessible`, false, `${r.status}`);
    continue;
  }

  const classeur = new ExcelJS.Workbook();
  await classeur.xlsx.load(await r.arrayBuffer());

  const noms = classeur.worksheets.map((w) => w.name);
  const tropLongs = noms.filter((n) => n.length > 31);
  const coupes = noms.filter((n) => n.endsWith('…') || n.includes('...'));

  check(
    `${chemin} : onglets valides`,
    tropLongs.length === 0 && coupes.length === 0,
    noms.map((n) => `"${n}" (${n.length})`).join(', ')
  );
}

console.log(`\nRésultat : ${ok} vérification(s) réussie(s), ${ko} échec(s).`);
process.exit(ko === 0 ? 0 : 1);

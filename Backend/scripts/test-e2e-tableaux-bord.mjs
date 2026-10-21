/**
 * Les points d'entrée du tableau de bord, avec tous les profils.
 *
 * Chaque endpoint est appelé avec chaque profil : une requête qui suppose
 * une jointure absente ne le signale que pour le profil qui la déclenche.
 * C'est exactement le cas qui a échappé aux campagnes précédentes — la
 * répartition par division plantait pour tout le monde, et le KPI
 * « incomplets » pour le seul secrétaire.
 */

const BASE = process.env.API_URL || 'http://localhost:5000/api';

let ok = 0;
let ko = 0;
const check = (nom, cond, detail = '') => {
  if (cond) { ok += 1; console.log(`  OK   ${nom}${detail ? ` — ${detail}` : ''}`); }
  else { ko += 1; console.error(`  ECHEC ${nom}${detail ? ` — ${detail}` : ''}`); }
};

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

const ENDPOINTS = [
  ['/dashboard/summary', 'le résumé'],
  ['/dashboard/by-division', 'la répartition par division'],
  ['/dashboard/by-status', 'la répartition par statut'],
  ['/dashboard/evolution', 'l\'évolution'],
  ['/dashboard/ressources', 'les ressources'],
  ['/dashboard/secretaire-kpis', 'les indicateurs du secrétariat'],
  ['/dashboard/boite-travail', 'la boîte de travail'],
];

async function login(identifiant, motDePasse) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password: motDePasse }),
  });
  return (await r.json()).token;
}

console.log('\n=== Tableau de bord — tous les profils ===\n');

for (const [identifiant, motDePasse] of COMPTES) {
  const token = await login(identifiant, motDePasse);
  for (const [chemin, libelle] of ENDPOINTS) {
    const r = await fetch(`${BASE}${chemin}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    /* Le KPI du secrétariat est réservé au secrétaire : les autres profils
       doivent s'y voir refuser l'accès (403), pas une erreur serveur. */
    const attendu = chemin === '/dashboard/secretaire-kpis'
      ? (identifiant === 'secretaire' ? 200 : 403)
      : 200;
    check(
      `${identifiant.padEnd(16)} ${libelle}`,
      r.status === attendu,
      r.status === attendu ? '' : `${r.status} (attendu ${attendu})`
    );
  }
}

console.log(`\nRésultat : ${ok} vérification(s) réussie(s), ${ko} échec(s).`);
process.exit(ko === 0 ? 0 : 1);

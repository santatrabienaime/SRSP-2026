/**
 * Remise en état des comptes de démonstration.
 *
 * Les campagnes de test désactivent des comptes et changent des mots de
 * passe : si une campagne est interrompue au milieu, le service peut rester
 * avec un compte désactivé ou un mot de passe modifié. Ce script rétablit
 * l'état nominal sans toucher aux données métier.
 *
 * Usage (depuis Backend/) : node scripts/reparer-comptes-demo.mjs
 */
import db from '../src/config/db.js';

const COMPTES = [
  'admin', 'secretaire', 'chef.service', 'chef.baaf', 'coordinatrice',
  'chef.visa', 'verif.visa', 'chef.solde', 'verif.solde',
  'chef.pension', 'liquidateur', 'chef.secours', 'charge.secours',
];

const rows = await db.query(
  `SELECT u.id, u.username, u.actif, u.tentatives_echouees, u.verrouille_jusqua, a.id AS agent_id
   FROM users u
   LEFT JOIN agents a ON a.user_id = u.id
   ORDER BY u.id`
);

for (const r of rows) {
  console.log(
    `${String(r.id).padStart(3)} ${String(r.username).padEnd(18)} actif=${r.actif} ` +
    `agent=${r.agent_id ?? '—'} echecs=${r.tentatives_echouees ?? 0}`
  );
}

// Remise en état : tous les comptes de démonstration sont réactivés.
await db.query(
  `UPDATE users SET actif = 1, tentatives_echouees = 0, verrouille_jusqua = NULL
   WHERE username IN (?)`,
  [COMPTES]
);
// Les fiches agents portent le même état : l'activation et la désactivation
// d'une personne touchent les deux.
await db.query(
  `UPDATE agents a JOIN users u ON u.id = a.user_id
   SET a.actif = 1
   WHERE u.username IN (?)`,
  [COMPTES]
);
console.log('\nComptes et fiches de démonstration réactivés.');

process.exit(0);

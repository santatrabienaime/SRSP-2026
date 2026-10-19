/**
 * Vérification : la division, le nom et la fonction d'un compte sont lus sur sa
 * fiche, même si l'ancienne base portait plusieurs fiches pour un même compte.
 *
 * Contrôle ponctuel d'un correctif (jointure `FICHE_DU_COMPTE`), à lancer depuis
 * le dossier Backend :
 *   node scripts/verifier-perimetre-comptes.mjs
 */
import { getScope } from '../src/services/scopeService.js';
import db from '../src/config/db.js';

const comptes = await db.query(
  'SELECT id, username FROM users WHERE actif = 1 ORDER BY id'
);

let sansFiche = 0;
for (const c of comptes) {
  const scope = await getScope(c.id);
  const [fiche] = scope?.agentId
    ? await db.query('SELECT nom, prenom FROM agents WHERE id = ?', [scope.agentId])
    : [];
  const nom = fiche ? `${fiche.nom} ${fiche.prenom}` : '';
  if (!scope?.agentId) sansFiche += 1;
  console.log(
    `#${c.id} ${c.username.padEnd(24)} fiche=${String(scope?.agentId ?? '—').padEnd(4)}` +
    ` division=${String(scope?.divisionId ?? '—').padEnd(4)} role=${String(scope?.roleNom ?? '—').padEnd(28)} ${nom}`
  );
}

const doublons = await db.query(
  `SELECT user_id, COUNT(*) AS n FROM agents WHERE user_id IS NOT NULL
   GROUP BY user_id HAVING COUNT(*) > 1`
);

console.log(`\nComptes lus : ${comptes.length}`);
console.log(`Comptes sans fiche : ${sansFiche}`);
console.log(`Comptes portant plusieurs fiches : ${doublons.length}`);
process.exit(0);

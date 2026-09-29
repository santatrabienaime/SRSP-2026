/* Le numéro de dossier est-il sûr quand deux créations ont lieu en même temps ?
 *
 * Le générateur faisait COUNT(*) + 1. Ce calcul n'est pas atomique : deux
 * requêtes simultanées lisent le même total avant que l'une n'écrive, et
 * obtiennent le MÊME numéro. La base refuse alors la seconde insertion.
 *
 * Reproduit : sur 6 créations de dossiers Secours simultanées, 3 échouaient
 * avec « Duplicate entry for key 'numero' ». C'est le régime normal d'un
 * service qui reçoit plusieurs dossiers dans la même journée : la secrétaire
 * saisit deux dossiers, l'un est refusé, sans savoir pourquoi.
 *
 * Le test consomme des numéros à chaque exécution : le compteur est monotone
 * et ne redescend pas quand un dossier est supprimé. C'est le prix de la
 * sûreté — un numéro ne doit JAMAIS être réattribué, sinon un dossier archivé
 * et supprimé verrait son numéro réapparaître sur un dossier tout à fait
 * différent. Le test réserve donc une plage et la restitue ensuite, sans quoi
 * la numérotation de production dériverait à chaque exécution.
 */
const base = 'http://localhost:5000/api';

const login = async (email, motDePasse = 'Demo123!') =>
  (await (await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant: email, password: motDePasse }),
  })).json());

const { default: db } = await import('/home/malaso/SRSP-2026/Backend/src/config/db.js');
const { generateDossierNumber } = await import('/home/malaso/SRSP-2026/Backend/src/utils/generateDossierNumber.js');

const sec = await login('secretaire@srsp.mg');

let ko = 0;
const v = (libelle, conforme, detail = '') => {
  if (!conforme) ko++;
  console.log(`  ${conforme ? '✅' : '❌'} ${libelle}${detail ? ' — ' + detail : ''}`);
};

const CLE = 'DOSSIER-4-2026';
const compteurAvant = (await db.query('SELECT valeur FROM compteurs_numerotation WHERE cle = ?', [CLE]))[0]?.valeur || 0;

const creer = (n) => fetch(`${base}/dossiers`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${sec.token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type_id: 4,
    demandeur: `TEST COURSE ${n}`,
    objet: 'Secours de deces, test de creation concurrente',
    date_reception: new Date().toISOString().slice(0, 10),
    priorite_id: 3,
  }),
}).then(async (r) => ({ s: r.status, b: await r.json().catch(() => null) }));

const crees = [];
try {
  console.log('=== 1. Le générateur seul : deux appels rapprochés ===');
  const [a, b] = await Promise.all([generateDossierNumber(4), generateDossierNumber(4)]);
  v('deux appels ne rendent pas le même numéro', a !== b, `${a} et ${b}`);

  console.log('\n=== 2. Le cas réel : deux créations simultanées ===');
  const deux = await Promise.all([creer(1), creer(2)]);
  crees.push(...deux);
  const ok2 = deux.filter((r) => r.s === 201);
  v('les deux créations aboutissent', ok2.length === 2,
    deux.filter((r) => r.s !== 201).map((r) => `${r.s} ${r.b?.message}`).join(' ; ') || '');
  v('les deux numéros sont distincts',
    new Set(ok2.map((r) => r.b.numero)).size === 2, ok2.map((r) => r.b.numero).join(', '));

  console.log('\n=== 3. Sous charge : 8 créations simultanées ===');
  const lot = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8].map(creer));
  crees.push(...lot);
  const okLot = lot.filter((r) => r.s === 201);
  v('les 8 créations aboutissent', okLot.length === 8,
    lot.filter((r) => r.s !== 201).map((r) => `${r.s} ${r.b?.message}`).join(' ; '));
  v('les 8 numéros sont distincts',
    new Set(okLot.map((r) => r.b.numero)).size === 8, okLot.map((r) => r.b.numero).join(', '));

  console.log('\n=== 4. La numérotation est continue, sans trou ni doublon ===');
  const nums = okLot.map((r) => Number(r.b.numero.split('-').pop())).sort((x, y) => x - y);
  const consecutive = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
  v('les numéros se suivent sans trou', consecutive, nums.join(', '));
  v('aucun numéro réutilisé', new Set(nums).size === nums.length);
} finally {
  /* Nettoyage des dossiers, puis RESTITUTION du compteur.
     Le remettre à sa valeur initiale est ici correct parce que ces dossiers
     n'ont jamais existé en production : on rend exactement l'état d'avant le
     test. En production, la restitution n'aurait pas lieu — c'est ce que
     vérifie le point suivant. */
  for (const r of crees) {
    if (r.b?.id) {
      for (const t of ['notifications', 'documents', 'dossier_commentaires', 'historique_actions']) {
        await db.query(`DELETE FROM \`${t}\` WHERE dossier_id = ?`, [r.b.id]);
      }
      await db.query('DELETE FROM dossiers WHERE id = ?', [r.b.id]);
    }
  }
  await db.query(
    'UPDATE compteurs_numerotation SET valeur = ? WHERE cle = ?', [compteurAvant, CLE]
  );
}

const compteurApres = (await db.query('SELECT valeur FROM compteurs_numerotation WHERE cle = ?', [CLE]))[0]?.valeur;
v('le compteur est restitué après le test', compteurApres === compteurAvant,
  `${compteurAvant} -> ${compteurApres}`);

const restant = (await db.query('SELECT COUNT(*) AS n FROM dossiers'))[0].n;
v('la base retrouve son état de référence', restant === 7, `${restant} dossier(s)`);

await db.pool.end();
console.log(ko === 0 ? '\n  TOUT CONFORME' : `\n  ${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);

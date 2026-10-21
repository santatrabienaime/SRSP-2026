/**
 * Vérification des chiffres du tableau de bord, contre le SQL.
 *
 * Une requête qui ne plante plus peut renvoyer des chiffres faux. Ce script
 * compare donc chaque réponse de l'API à ce que donne la base directement :
 * un écart signale une règle appliquée deux fois, ou pas du tout.
 */

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const db = (await import('../src/config/db.js')).default;

let ok = 0;
let ko = 0;
const check = (nom, cond, detail = '') => {
  if (cond) { ok += 1; console.log(`  OK   ${nom}${detail ? ` — ${detail}` : ''}`); }
  else { ko += 1; console.error(`  ECHEC ${nom}${detail ? ` — ${detail}` : ''}`); }
};

async function login(identifiant, password = 'Demo123!') {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password }),
  });
  return (await r.json()).token;
}

const token = await login('chef.service');
const entetes = { Authorization: `Bearer ${token}` };

const get = async (chemin) => (await fetch(`${BASE}${chemin}`, { headers: entetes })).json();

console.log('\n=== Cohérence des chiffres du tableau de bord ===\n');

/* Le compteur de référence : les dossiers hors brouillon, par division. */
const attenduParDivision = await db.query(
  `SELECT dv.nom AS division, COUNT(d.id) AS total
   FROM divisions dv
   LEFT JOIN dossiers d
     ON d.division_id = dv.id
    AND d.statut_id <> COALESCE(
          (SELECT id FROM statuts_dossiers WHERE code = 'BROUILLON'), -1)
   GROUP BY dv.id, dv.nom
   ORDER BY dv.nom`
);

const parDivision = await get('/dashboard/by-division');
check('by-division : une ligne par division',
  parDivision.length === attenduParDivision.length,
  `${parDivision.length} vs ${attenduParDivision.length}`);
check('by-division : les mêmes divisions',
  parDivision.every((d) => attenduParDivision.some((a) => a.division === d.division)));
check('by-division : les mêmes totaux',
  parDivision.every((d) => {
    const a = attenduParDivision.find((x) => x.division === d.division);
    return a && Number(a.total) === Number(d.total);
  }),
  parDivision.map((d) => `${d.division}: ${d.total}`).join(', '));

/* Les statuts : un statut à zéro dossier doit rester listé, et le
   pseudo-statut BROUILLON ne doit pas l'être — il ne fait pas partie du
   circuit affiché. */
const attenduParStatut = await db.query(
  `SELECT s.code, COUNT(d.id) AS total
   FROM statuts_dossiers s
   LEFT JOIN dossiers d ON d.statut_id = s.id
   WHERE s.code <> 'BROUILLON'
   GROUP BY s.id, s.code
   ORDER BY s.ordre`
);

const parStatut = await get('/dashboard/by-status');
const statutsVus = new Set(parStatut.map((s) => s.code));
check('by-status : le pseudo-statut BROUILLON est retiré',
  !statutsVus.has('BROUILLON'),
  statutsVus.has('BROUILLON') ? 'présent' : 'absent');
check('by-status : aucun total ne vient des brouillons',
  parStatut.every((s) => s.code !== 'BROUILLON' || Number(s.total) === 0));
check('by-status : les statuts sans dossier restent listés',
  attenduParStatut.filter((a) => Number(a.total) === 0)
    .every((a) => statutsVus.has(a.code)),
  attenduParStatut.filter((a) => Number(a.total) === 0).map((a) => a.code).join(', '));
check('by-status : tous les statuts du circuit sont listés',
  attenduParStatut.every((a) => statutsVus.has(a.code)),
  `${statutsVus.size} statut(s) affiché(s)`);
check('by-status : les totaux concordent',
  parStatut.every((s) => {
    const a = attenduParStatut.find((x) => x.code === s.code);
    return !a || Number(a.total) === Number(s.total);
  }));

/* Le compteur « total » du résumé doit exclure les brouillons. */
const totalHorsBrouillons = await db.query(
  `SELECT COUNT(*) AS n FROM dossiers d
   WHERE d.statut_id <> COALESCE(
     (SELECT id FROM statuts_dossiers WHERE code = 'BROUILLON'), -1)`
);
const resume = await get('/dashboard/summary');
check('summary : le total exclut les brouillons',
  Number(resume.total) === Number(totalHorsBrouillons[0].n),
  `${resume.total} vs ${totalHorsBrouillons[0].n}`);

/* Les compteurs par statut du résumé doivent eux aussi exclure les
   brouillons, et leur somme doit retrouver le total annoncé. */
const totalBrouillons = await db.query(
  `SELECT COUNT(*) AS n FROM dossiers d
   JOIN statuts_dossiers s ON d.statut_id = s.id
   WHERE s.code = 'BROUILLON'`
);
const compteursStatut = Object.entries(resume)
  .filter(([cle, valeur]) => /^[A-Z_]+$/.test(cle) && typeof valeur === 'number');
const sommeStatuts = compteursStatut.reduce((total, [, valeur]) => total + valeur, 0);
check('summary : la somme des compteurs par statut retrouve le total',
  sommeStatuts === Number(resume.total),
  `${sommeStatuts} vs ${resume.total} (${totalBrouillons[0].n} brouillon(s) exclu(s))`);
check('summary : le pseudo-statut BROUILLON ne compte rien',
  (resume.BROUILLON ?? 0) === 0,
  `BROUILLON = ${resume.BROUILLON ?? 0}`);

/* Les fichiers d'attente doivent être cohérents avec le résumé. */
const boite = await get('/dashboard/boite-travail');
check('boîte de travail : les compteurs sont des nombres',
  ['a_traiter_par_moi', 'en_attente_validation', 'incomplets', 'clotures_recents']
    .every((cle) => typeof boite[cle]?.total === 'number'),
  `à traiter : ${boite.a_traiter_par_moi?.total}`);

console.log(`\nRésultat : ${ok} vérification(s) réussie(s), ${ko} échec(s).`);
process.exit(ko === 0 ? 0 : 1);

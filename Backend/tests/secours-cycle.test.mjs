/* Circuit Secours de bout en bout, contre l'API réelle.
 *
 * Le document décrit 14 étapes dont 5 nouvelles. Ce test en vérifie l'enchaînement
 * et, surtout, la séparation des fonctions : le Chef de Division Secours
 * enregistre le visa, appose le cachet et génère l'état d'émargement, mais il
 * ne signe pas ses propres pièces de mandatement. C'est le point le plus
 * facile à laisser passer, et le plus grave : un ordonnateur qui signe sa
 * propre dépense rend le visa de contrôle financier sans valeur. */
const base = 'http://localhost:5000/api';

const login = async (email, motDePasse = 'Demo123!') =>
  (await (await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant: email, password: motDePasse }),
  })).json());

const g = async (t, chemin, options = {}) => {
  const r = await fetch(base + chemin, {
    method: options.method || 'GET',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let b = null; try { b = await r.json(); } catch { b = null; }
  return { s: r.status, b };
};

let ko = 0;
const v = (libelle, conforme, detail = '') => {
  if (!conforme) ko++;
  console.log(`  ${conforme ? '✅' : '❌'} ${libelle}${detail ? ' — ' + detail : ''}`);
};
const attendu = async (libelle, reponse, code) => {
  const conforme = reponse.s === code;
  v(libelle, conforme, conforme ? String(code) : `reçu ${reponse.s} ${JSON.stringify(reponse.b)}`);
};

const secretaire = await login('secretaire@srsp.mg');
const chef = await login('chef.secours@srsp.mg');
const charge = await login('charge.secours@srsp.mg');
const chefService = await login('chefservice@srsp.mg');

/* --- Mise en place : un dossier Secours et son mandatement --- */
const creation = await g(secretaire.token, '/dossiers', {
  method: 'POST',
  body: {
    type_id: 4, demandeur: 'RAKOTOARISOA Jean Pierre',
    objet: 'Secours de deces a titre de conjoint survivant',
    date_reception: new Date().toISOString().slice(0, 10),
    priorite_id: 3,
  },
});
v('dossier Secours cree', creation.s === 201, JSON.stringify(creation.b).slice(0, 120));
const d = creation.b.id;

const mandat = await g(chef.token, `/dossiers/${d}/mandatement`, {
  method: 'POST',
  body: {
    montant_total: 5000000,
    beneficiaires: [
      { nom: 'RAKOTO', prenom: 'Marie', lien: 'Epouse', quote_part: 60 },
      { nom: 'RAKOTO', prenom: 'Pierre', lien: 'Fils', quote_part: 20 },
      { nom: 'RAKOTO', prenom: 'Paul', lien: 'Fils', quote_part: 20 },
    ],
  },
});
await attendu('mandatement enregistre', mandat, 200);
const montantCalcule = mandat.b.beneficiaires.map((b) => Number(b.montant));
v('les montants sont calcules depuis les quotes-parts',
  JSON.stringify(montantCalcule) === JSON.stringify([3000000, 1000000, 1000000]),
  montantCalcule.join(' + '));

console.log('\n=== 1.1 Visa du controle financier ===');
await attendu('etat de reception avant visa',
  await g(chef.token, `/dossiers/${d}/secours/reception`), 200);
const avantVisa = await g(chef.token, `/dossiers/${d}/secours/reception`);
v('dossier incomplet sans visa', avantVisa.b.complet === false,
  `manquantes : ${(avantVisa.b.pieces_manquantes || []).length}`);
v('les 4 pieces du PGA sont attendues', avantVisa.b.pieces_attendues === 4, String(avantVisa.b.pieces_attendues));

await attendu('un agent de traitement ne peut pas viser',
  await g(charge.token, `/dossiers/${d}/secours/visa`, {
    method: 'POST',
    body: { numero_visa: 'CF-2026-001', date_visa: '2026-09-20' },
  }), 403);
await attendu('chef secours enregistre le visa',
  await g(chef.token, `/dossiers/${d}/secours/visa`, {
    method: 'POST',
    body: { numero_visa: 'CF-2026-001', signe_par: 'RAKOTO M. (CF)', date_visa: '2026-09-20' },
  }), 201);
await attendu('le meme dossier ne peut etre vise deux fois',
  await g(chef.token, `/dossiers/${d}/secours/visa`, {
    method: 'POST',
    body: { numero_visa: 'CF-2026-AUTRE', date_visa: '2026-09-20' },
  }), 409);

const lectureVisa = await g(chef.token, `/dossiers/${d}/secours/visa`);
v('le visa est relu', lectureVisa.b.numero_visa === 'CF-2026-001', lectureVisa.b.numero_visa);
v('la signature du CF est conservee', lectureVisa.b.signe_par === 'RAKOTO M. (CF)', lectureVisa.b.signe_par);

console.log('\n=== 2.4 Cachet, titre et date ===');
await attendu('un visa sans titre d ordonnateur est refuse',
  await g(chef.token, `/dossiers/${d}/secours/cachet`, {
    method: 'POST', body: { date_cachet: '2026-09-25', nom_ordonnateur: 'RAKOTO' },
  }), 400);
await attendu('le charge de secours appose le cachet',
  await g(charge.token, `/dossiers/${d}/secours/cachet`, {
    method: 'POST',
    body: {
      date_cachet: '2026-09-25', titre_ordonnateur: 'Chef de Service',
      nom_ordonnateur: 'RAKOTO Jean',
    },
  }), 200);
const cachet = await g(charge.token, `/dossiers/${d}/secours/cachet`);
v('le titre est enregistre', cachet.b.titre_ordonnateur === 'Chef de Service', cachet.b.titre_ordonnateur);
v('le nom de l ordonnateur est enregistre', cachet.b.nom_ordonnateur === 'RAKOTO Jean', cachet.b.nom_ordonnateur);
/* Une DATE revient en UTC : 2026-09-25 peut s'afficher 2026-09-24T21:00Z
   depuis Madagascar (UTC+3). On compare donc au jour local, comme le ferait
   l'écran, et non à la chaîne brute renvoyée par le serveur. */
const jourLocal = (valeur) => {
  const d = new Date(valeur);
  return Number.isNaN(d.getTime()) ? valeur : d.toLocaleDateString('fr-CA', { timeZone: 'Indian/Antananarivo' });
};
v('la date du cachet est enregistree', jourLocal(cachet.b.date_cachet) === '2026-09-25',
  `${cachet.b.date_cachet} -> ${jourLocal(cachet.b.date_cachet)}`);
await attendu('cachet reposable (une seule ligne par mandat)',
  await g(charge.token, `/dossiers/${d}/secours/cachet`, {
    method: 'POST',
    body: { date_cachet: '2026-09-26', titre_ordonnateur: 'Chef de Service', nom_ordonnateur: 'RAKOTO Jean' },
  }), 200);

console.log('\n=== 1.6 References du logiciel secours et etat d emargement ===');
const refs = await g(chef.token, `/dossiers/${d}/secours/references`);
v('les references a reporter sont calculees', refs.s === 200 && Array.isArray(refs.b.references),
  refs.b.references?.length + ' reference(s)');
v('le montant a engager est fourni',
  refs.b.references.some((r) => r.code === 'MONTANT_TOTAL' && r.valeur.includes('5')),
  refs.b.references.find((r) => r.code === 'MONTANT_TOTAL')?.valeur);
v('un beneficiaire par reference',
  refs.b.references.filter((r) => r.code.startsWith('BENEFICIAIRE')).length === 3);

await attendu('etat d emargement genere', await g(chef.token, `/dossiers/${d}/secours/emargement`, { method: 'POST' }), 200);
const emarg = await g(chef.token, `/dossiers/${d}/secours/emargement`);
v('une ligne par beneficiaire', emarg.b.total === 3, String(emarg.b.total));
v('aucun signe au depart', emarg.b.signs === 0, `${emarg.b.signs}/${emarg.b.total}`);

const premierBenef = emarg.b.lignes[0].id;
await attendu('emargement sans date refuse',
  await g(chef.token, `/dossiers/${d}/secours/emargement/${premierBenef}`, {
    method: 'PUT', body: { signataire: 'RAKOTO Marie' },
  }), 400);
const signe = await g(chef.token, `/dossiers/${d}/secours/emargement/${premierBenef}`, {
  method: 'PUT',
  body: { signataire: 'RAKOTO Marie', signe_le: '2026-09-26' },
});
v('signature du beneficiaire enregistree', signe.b.signs === 1, `${signe.b.signs}/${signe.b.total}`);
v('le nom du signataire est conserve',
  signe.b.lignes.find((l) => l.id === premierBenef)?.signataire === 'RAKOTO Marie');

console.log('\n=== 1.7 Signature de l ordonnateur : separation des fonctions ===');
await attendu('le chef de division Secours NE PEUT PAS signer ses propres pieces',
  await g(chef.token, `/dossiers/${d}/secours/signature`, {
    method: 'POST', body: { reference_signature: 'SIG-CHEF-SECOURS-1' },
  }), 403);
await attendu('le charge de secours ne peut pas signer non plus',
  await g(charge.token, `/dossiers/${d}/secours/signature`, {
    method: 'POST', body: { reference_signature: 'SIG-CHARGE-1' },
  }), 403);
await attendu('le chef de SERVICE signe',
  await g(chefService.token, `/dossiers/${d}/secours/signature`, {
    method: 'POST', body: { reference_signature: 'SIG-2026-0042' },
  }), 201);
const signature = await g(chef.token, `/dossiers/${d}/secours/signature`);
v('la reference est enregistree', signature.b.reference_signature === 'SIG-2026-0042', signature.b.reference_signature);
v('la date et heure de signature sont posees', !!signature.b.signe_le, signature.b.signe_le);
v('une piece deja signee ne se resigne pas',
  (await g(chefService.token, `/dossiers/${d}/secours/signature`, {
    method: 'POST', body: { reference_signature: 'SIG-AUTRE-999' },
  })).s === 409);

await attendu('la copie signee peut etre archivee',
  await g(chef.token, `/dossiers/${d}/secours/signature/archiver`, { method: 'POST' }), 200);
const archive = await g(chef.token, `/dossiers/${d}/secours/signature`);
v('l archivage est trace', !!archive.b.archive_le, archive.b.archive_le);

console.log('\n=== Vue d ensemble ===');
const complet = await g(chef.token, `/dossiers/${d}/secours/etat`);
v('les cinq etapes sont reunies', !!complet.b.visa && !!complet.b.emargement && !!complet.b.signature && !!complet.b.cachet,
  `visa:${!!complet.b.visa} emargement:${!!complet.b.emargement} signature:${!!complet.b.signature} cachet:${!!complet.b.cachet}`);

console.log('\n=== Cloisonnement ===');
const autreDivision = await g((await login('chef.visa@srsp.mg')).token, `/dossiers/${d}/secours/etat`);
v('un chef d autre division ne lit pas le dossier Secours', autreDivision.s === 403, autreDivision.b?.message);

console.log(`\n  dossier de test : ${d}`);

/* Nettoyage : la suite ne doit rien laisser derrière elle. */
const { default: db } = await import('../src/config/db.js');
for (const id of [d]) {
  await db.query('DELETE FROM mandatement_beneficiaires WHERE mandatement_id IN (SELECT id FROM mandatements WHERE dossier_id = ?)', [id]);
  await db.query('DELETE FROM mandatement_pieces_etat WHERE mandatement_id IN (SELECT id FROM mandatements WHERE dossier_id = ?)', [id]);
  await db.query('DELETE FROM etats_emargement WHERE mandatement_id IN (SELECT id FROM mandatements WHERE dossier_id = ?)', [id]);
  await db.query('DELETE FROM references_logiciel_secours WHERE mandatement_id IN (SELECT id FROM mandatements WHERE dossier_id = ?)', [id]);
  await db.query('DELETE FROM signatures_ordonnateur WHERE mandatement_id IN (SELECT id FROM mandatements WHERE dossier_id = ?)', [id]);
  await db.query('DELETE FROM cachets_mandatement WHERE mandatement_id IN (SELECT id FROM mandatements WHERE dossier_id = ?)', [id]);
  await db.query('DELETE FROM mandatements WHERE dossier_id = ?', [id]);
  await db.query('DELETE FROM visas_controle_financier WHERE dossier_id = ?', [id]);
  for (const t of ['notifications', 'documents', 'dossier_commentaires', 'verifications', 'traitements', 'validations', 'affectations', 'archives', 'depouillements']) {
    await db.query(`DELETE FROM \`${t}\` WHERE dossier_id = ?`, [id]);
  }
  await db.query('DELETE FROM historique_actions WHERE dossier_id = ?', [id]);
  await db.query('DELETE FROM dossiers WHERE id = ?', [id]);
}
const restant = await db.query('SELECT COUNT(*) AS n FROM dossiers');
v('la suite ne laisse aucun residu', restant[0].n === 7, `${restant[0].n} dossier(s)`);
await db.pool.end();

console.log(ko === 0 ? '\n  TOUT CONFORME' : `\n  ❌ ${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);

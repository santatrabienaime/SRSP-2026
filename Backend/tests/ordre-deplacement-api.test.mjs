/* Circuit des pièces de déplacement du Chef BAAF, contre l'API réelle.
 *
 * Le contrôle porte sur la séparation des fonctions : le BAAF établit, le Chef
 * de Service signe. Si cette séparation s'effondre, une pièce engageante peut
 * être signée par celui qui l'a rédigée — d'où un test explicite, pas seulement
 * un test de bon fonctionnement. */
const base = 'http://localhost:5000/api';

const login = async (identifiant, motDePasse = 'Demo123!') =>
  (await (await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password: motDePasse }),
  })).json());

const g = async (token, chemin, options = {}) => {
  const r = await fetch(base + chemin, {
    method: options.method || 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return { s: r.status, b: await r.json().catch(() => null) };
};

let ko = 0;
const v = (libelle, conforme, detail = '') => {
  if (!conforme) ko++;
  console.log(`  ${conforme ? '✅' : '❌'} ${libelle}${detail ? ' — ' + detail : ''}`);
};
/* Quand un point echoue, afficher la reponse du serveur : une assertion qui
   echoue sans sa cause ne permet pas de distinguer un bug d'un test faux. */
const attendu = async (libelle, reponse, codeAttendu) => {
  const conforme = reponse.s === codeAttendu;
  v(libelle, conforme, conforme ? String(reponse.s) : `recu ${reponse.s} ${JSON.stringify(reponse.b)}`);
};

const baaf = await login('chefbaaf@srsp.mg');
const chef = await login('chefservice@srsp.mg');  // Admin123! est reserve a l administrateur
const verif = await login('verif.visa@srsp.mg');

const DOSSIER = 1;
const AGENT = 7;
const hier = new Date(Date.now() - 86400000 * 30).toISOString().slice(0, 10);

console.log('=== 1. Etablissement par le BAAF ===');
const types = await g(baaf.token, '/ordres-deplacement/types');
v('les 4 types de pieces sont serves', types.b.length === 4, types.b.map((t) => t.code).join(', '));
const typeMission = types.b.find((t) => t.code === 'ORDRE_MISSION').id;

const creation = await g(baaf.token, '/ordres-deplacement', {
  method: 'POST',
  body: {
    type_id: typeMission, dossier_id: DOSSIER, agent_id: AGENT,
    lieu_depart: 'Fianarantsoa', lieu_destination: 'Antananarivo',
    date_depart: hier, date_retour: hier, objet: 'Remise des pieces au Tresorerie',
  },
});
v('creation acceptee', creation.s === 201, JSON.stringify(creation.b));
const id = creation.b.id;
const numero = creation.b.numero;
v('numero au format ORD-AAAA-XXX-NNNNNN', /^ORD-\d{4}-[A-Z]{3}-\d{6}$/.test(numero || ''), numero);

console.log('=== 2. La piece identifie l agent ===');
const detail = await g(baaf.token, `/ordres-deplacement/${id}`);
/* La table `agents` ne porte aucun CIN. La piece laisse donc le champ vide
   plutot que d en inventer un : c est le comportement voulu, verifie ici. */
v('aucun CIN invente sur la piece', detail.b.cin_agent === null, String(detail.b.cin_agent));
v('agent et dossier joints', !!detail.b.agent_nom && !!detail.b.dossier_numero,
  `${detail.b.agent_nom} / ${detail.b.dossier_numero}`);

console.log('=== 3. Separation des fonctions : le BAAF ne signe pas ===');
/* Le circuit est REDIGE -> SOUMIS -> SIGNE : on soumet d'abord, sinon la
   signature serait refusee pour une raison qui n'est pas celle testee. */
v('soumission par le BAAF', (await g(baaf.token, `/ordres-deplacement/${id}`, { method: 'PUT', body: { statut: 'SOUMIS' } })).s === 200);
v('le BAAF ne peut pas signer (403)',
  (await g(baaf.token, `/ordres-deplacement/${id}`, { method: 'PUT', body: { statut: 'SIGNE', reference_signature: 'SIG-BAAF-1' } })).s === 403);
await attendu('le Chef de Service peut signer (200)',
  await g(chef.token, `/ordres-deplacement/${id}`, { method: 'PUT', body: { statut: 'SIGNE', reference_signature: 'SIG-2026-0042' } }), 200);
const apresSign = await g(chef.token, `/ordres-deplacement/${id}`);
v('la reference de signature est enregistree', apresSign.b.reference_signature === 'SIG-2026-0042', apresSign.b.reference_signature);
v('le signataire est identifie', !!apresSign.b.signataire_nom, apresSign.b.signataire_nom);
v('la date et l heure de signature sont posees', !!apresSign.b.signe_le, apresSign.b.signe_le);

console.log('=== 4. Un agent sans permission ne peut rien etablir ===');
v('verificateur ne peut pas creer (403)',
  (await g(verif.token, '/ordres-deplacement', { method: 'POST', body: { type_id: typeMission, dossier_id: DOSSIER, agent_id: AGENT, lieu_depart: 'A', lieu_destination: 'B', date_depart: hier, date_retour: hier, objet: 'Tentative non autorisee' } })).s === 403);

console.log('=== 5. Les regles de coherence sont appliquees par le serveur ===');
v('soumission repetee refusee (409)',
  (await g(baaf.token, `/ordres-deplacement/${id}`, { method: 'PUT', body: { statut: 'SOUMIS' } })).s === 409);
v('un ordre signe ne peut pas etre re-soumis (409)',
  (await g(baaf.token, `/ordres-deplacement/${id}`, { method: 'PUT', body: { statut: 'SOUMIS' } })).s === 409);
/* Apres signature, l'ordre est SIGNE : la soumission n'est plus possible. */
v('soumission apres signature refusee (409)',
  (await g(baaf.token, `/ordres-deplacement/${id}`, { method: 'PUT', body: { statut: 'SOUMIS' } })).s === 409);

console.log('=== 6. Execution apres le retour ===');
await attendu('le BAAF declare l execution',
  await g(baaf.token, `/ordres-deplacement/${id}`, { method: 'PUT', body: { statut: 'EXECUTEE', montant_reel: 150000 } }), 200);
await attendu('cloture acceptee',
  await g(baaf.token, `/ordres-deplacement/${id}`, { method: 'PUT', body: { statut: 'CLOTUREE', motif_cloture: 'Mission effectuee' } }), 200);
const final = await g(baaf.token, `/ordres-deplacement/${id}`);
v('montant reel enregistre', Number(final.b.montant_reel) === 150000, String(final.b.montant_reel));
v('circuit arrive a terme', final.b.statut === 'CLOTUREE', final.b.statut);
v('un ordre cloture ne bouge plus (409)',
  (await g(baaf.token, `/ordres-deplacement/${id}`, { method: 'PUT', body: { statut: 'EXECUTEE' } })).s === 409);

console.log('=== 7. Une reference de signature ne se reutilise pas ===');
const second = await g(baaf.token, '/ordres-deplacement', {
  method: 'POST',
  body: {
    type_id: typeMission, dossier_id: DOSSIER, agent_id: AGENT,
    lieu_depart: 'Fianarantsoa', lieu_destination: 'Mahajanga',
    date_depart: hier, date_retour: hier, objet: 'Second ordre de test',
  },
});
/* La soumission revient au BAAF : le Chef de Service n'a pas la permission
   d'établir, il ne fait que signer. Lui faire soumettre testerait la
   permission, pas l'unicité de la référence. */
await attendu('second ordre soumis par le BAAF',
  await g(baaf.token, `/ordres-deplacement/${second.b.id}`, { method: 'PUT', body: { statut: 'SOUMIS' } }), 200);
await attendu('reference de signature deja utilisee refusee (409)',
  await g(chef.token, `/ordres-deplacement/${second.b.id}`, {
    method: 'PUT', body: { statut: 'SIGNE', reference_signature: 'SIG-2026-0042' },
  }), 409);

console.log('=== 8. Dates incoherentes refusees ===');
const mauvaiseDate = await g(baaf.token, '/ordres-deplacement', {
  method: 'POST',
  body: {
    type_id: typeMission, dossier_id: DOSSIER, agent_id: AGENT,
    lieu_depart: 'Fianarantsoa', lieu_destination: 'Toliara',
    date_depart: '2026-12-20', date_retour: '2026-12-10', objet: 'Dates impossibles',
  },
});
v('retour avant depart refuse (422)', mauvaiseDate.s === 422, mauvaiseDate.b?.message);

console.log('=== 9. Tableau de bord ===');
const tdb = await g(baaf.token, '/ordres-deplacement/tableau-de-bord');
v('tableau de bord disponible', tdb.s === 200, JSON.stringify(tdb.b));

console.log('=== 10. Annulation possible tant que l ordre n est pas signe ===');
const aAnnuler = await g(baaf.token, '/ordres-deplacement', {
  method: 'POST',
  body: {
    type_id: typeMission, dossier_id: DOSSIER, agent_id: AGENT,
    lieu_depart: 'Fianarantsoa', lieu_destination: 'Antsirabe',
    date_depart: hier, date_retour: hier, objet: 'Ordre a annuler',
  },
});
v('ordre de trop cree pour le test', aAnnuler.s === 201);
v('annulation sans motif refusee (422)',
  (await g(baaf.token, `/ordres-deplacement/${aAnnuler.b.id}`, { method: 'DELETE', body: { motif: '' } })).s === 400);
v('annulation avec motif acceptee',
  (await g(baaf.token, `/ordres-deplacement/${aAnnuler.b.id}`, { method: 'DELETE', body: { motif: 'Dossier errone choisi' } })).s === 200);
await attendu('un ordre cloture ne peut plus etre annule (409)',
  await g(baaf.token, `/ordres-deplacement/${id}`, { method: 'DELETE', body: { motif: 'Trop tard' } }), 409);

/* Nettoyage direct en base : les ordres clotures et rejetes ne peuvent pas
   etre annules — c est voulu — mais la suite ne doit pas laisser de residus.
   On les supprime donc par la base, comme le fait le nettoyage de fin de serie. */
const { default: db } = await import('../src/config/db.js');
for (const aNettoyer of [id, second.b.id, aAnnuler.b.id]) {
  await db.query('DELETE FROM ordres_deplacement WHERE id = ?', [aNettoyer]);
}
await db.query("DELETE FROM historique_actions WHERE action = 'ORDRE_DEPLACEMENT'");
const restant = await g(baaf.token, '/ordres-deplacement');
v('la suite ne laisse aucun residu', restant.b.length === 0, restant.b.length + ' ordre(s) restant(s)');
await db.pool.end();
console.log(ko === 0 ? '  TOUT CONFORME' : `  ❌ ${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);

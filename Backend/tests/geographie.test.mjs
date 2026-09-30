/* Périmètre géographique : rattachement des dossiers aux 6 districts.
 *
 * Ce que le test vérifie, et pourquoi :
 *   - la carte administrative est celle du document (2 antennes, 6 districts) ;
 *   - un dossier ne peut avoir qu'UN district courant, sinon le rapport par
 *     antenne compterait le même dossier deux fois et le total dépasserait le
 *     nombre de dossiers ;
 *   - l'historisation est conservée, pour savoir quel district était le sien à
 *     la date d'ouverture ;
 *   - les dossiers SANS district sont comptés à part, pas perdus : les ignorer
 *     ferait croire que le service en a moins qu'il n'en a.
 */
const base = 'http://localhost:5000/api';

const login = async (email, motDePasse = 'Demo123!') =>
  (await (await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant: email, password: motDePasse }),
  })).json());

const { default: db } = await import('/home/malaso/SRSP-2026/Backend/src/config/db.js');

let ko = 0;
const v = (libelle, conforme, detail = '') => {
  if (!conforme) ko++;
  console.log(`  ${conforme ? '✅' : '❌'} ${libelle}${detail ? ' — ' + detail : ''}`);
};

const g = async (t, chemin, options = {}) => {
  const r = await fetch(base + chemin, {
    method: options.method || 'GET',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return { s: r.status, b: await r.json().catch(() => null) };
};

const sec = await login('secretaire@srsp.mg');
const chefVisa = await login('chef.visa@srsp.mg');
const verif = await login('verif.visa@srsp.mg');

/* Le test cree un dossier VISA, donc consomme un numero. Sans restitution, le
   compteur deriverait a chaque execution : apres quarante executions, le
   premier dossier reel porterait le numero 41. La restitution porte sur CE
   test, dont le dossier n'a jamais existe en production. */
const CLE_COMPTEUR = 'DOSSIER-1-2026';
const COMPTEUR_AVANT = (await db.query(
  'SELECT valeur FROM compteurs_numerotation WHERE cle = ?', [CLE_COMPTEUR]
))[0]?.valeur || 0;

let idDossier = null;
try {
  console.log('=== 1. La carte administrative du document ===');
  const ref = (await g(sec.token, '/geographie/referentiel')).b;
  v('deux antennes', ref.antennes.length === 2, ref.antennes.map((a) => a.libelle).join(', '));
  v('six districts au total', ref.districts.length === 6, String(ref.districts.length));
  v('trois districts par antenne', ref.antennes.every((a) => a.nb_districts === 3),
    ref.antennes.map((a) => `${a.code}:${a.nb_districts}`).join(' '));

  const sieges = ref.antennes.filter((a) => a.siege);
  v('un seul siege', sieges.length === 1, sieges[0]?.libelle);
  v('le siege est Manakara', sieges[0]?.code === 'MANAKARA', sieges[0]?.code);

  /* La répartition exacte du document, district par district. */
  const attendu = {
    MANANJARY: ['Ifanadiana', 'Nosy Varika', 'Mananjary'],
    MANAKARA: ['Ikongo', 'Vohipeno', 'Manakara'],
  };
  for (const [code, districts] of Object.entries(attendu)) {
    const reels = ref.districts.filter((d) => d.antenne_code === code).map((d) => d.libelle).sort();
    v(`${code} : ${districts.join(', ')}`,
      JSON.stringify(reels) === JSON.stringify([...districts].sort()), reels.join(', '));
  }

  console.log('\n=== 2. Rattachement d’un dossier ===');
  const creation = await g(sec.token, '/dossiers', {
    method: 'POST',
    body: {
      type_id: 1, demandeur: 'TEST GEOGRAPHIE',
      objet: 'Test de rattachement à un district',
      date_reception: new Date().toISOString().slice(0, 10),
      priorite_id: 3,
    },
  });
  idDossier = creation.b.id;
  v('dossier créé', creation.s === 201, creation.b.numero);

  const manakara = ref.districts.find((d) => d.code === 'MANAKARA');
  const rattachement = await g(sec.token, `/geographie/dossiers/${idDossier}/district`, {
    method: 'POST', body: { district_id: manakara.id },
  });
  v('rattachement accepté', rattachement.s === 201, rattachement.b?.district || rattachement.b?.message);

  const lu = await g(sec.token, `/geographie/dossiers/${idDossier}/district`);
  v('le district courant est renvoyé', lu.b?.district_code === 'MANAKARA', lu.b?.district_libelle);
  v('l’antenne est déduite du district', lu.b?.antenne_code === 'MANAKARA', lu.b?.antenne_libelle);
  v('le district n’est pas une copie de l’antenne',
    lu.b?.district_id !== lu.b?.antenne_id, `district ${lu.b?.district_id} / antenne ${lu.b?.antenne_id}`);

  console.log('\n=== 3. Un seul district courant ===');
  const ifanadiana = ref.districts.find((d) => d.code === 'IFANADIANA');
  const second = await g(sec.token, `/geographie/dossiers/${idDossier}/district`, {
    method: 'POST', body: { district_id: ifanadiana.id },
  });
  v('un second rattachement est accepté', second.s === 201);

  const historiques = await g(sec.token, `/geographie/dossiers/${idDossier}/district/historique`);
  v('l’historique conserve les DEUX rattachements', historiques.b.length === 2,
    historiques.b.map((h) => `${h.district_libelle}(${h.courante ? 'courant' : 'passé'})`).join(', '));
  v('un seul est marqué courant',
    historiques.b.filter((h) => h.courante).length === 1);

  const courant = await g(sec.token, `/geographie/dossiers/${idDossier}/district`);
  v('le district courant est bien le second', courant.b?.district_code === 'IFANADIANA', courant.b?.district_libelle);

  console.log('\n=== 4. Le rapport par antenne ne compte pas deux fois ===');
  const syn = await g(sec.token, '/geographie/synthese');
  v('synthèse disponible', syn.s === 200);
  const totalAntennes = syn.b.antennes.reduce((s, a) => s + a.total, 0);
  v('la somme des antennes ne dépasse pas le total',
    totalAntennes <= syn.b.total, `${totalAntennes} dans les antennes / ${syn.b.total} au total`);
  v('dossiers sans district comptés à part',
    syn.b.dossiers_sans_district + syn.b.dossiers_rattaches === syn.b.total,
    `${syn.b.dossiers_rattaches} rattachés + ${syn.b.dossiers_sans_district} sans = ${syn.b.total}`);

  const ligneMananjary = syn.b.antennes.find((a) => a.antenne_code === 'MANANJARY');
  v('le dossier apparaît dans SON antenne',
    ligneMananjary?.total >= 1, `Mananjary: ${ligneMananjary?.total}`);
  v('et pas dans l’autre',
    !syn.b.antennes.find((a) => a.antenne_code === 'MANAKARA' && a.total >= 1));

  console.log('\n=== 5. Cloisonnement ===');
  // Le chef de division ne peut pas rattacher : le rattachement territorial
  // relève de l'enregistrement, pas du chef de service d'une division.
  v('le chef de division ne rattache pas',
    (await g(chefVisa.token, `/geographie/dossiers/${idDossier}/district`, {
      method: 'POST', body: { district_id: manakara.id },
    })).s === 403);
  v('un agent de traitement non plus',
    (await g(verif.token, `/geographie/dossiers/${idDossier}/district`, {
      method: 'POST', body: { district_id: manakara.id },
    })).s === 403);
  v('mais tout le monde peut consulter le référentiel',
    (await g(verif.token, '/geographie/referentiel')).s === 200);

  console.log('\n=== 6. District invalide ===');
  v('district inexistant refusé',
    (await g(sec.token, `/geographie/dossiers/${idDossier}/district`, {
      method: 'POST', body: { district_id: 9999 },
    })).s === 400);
  v('district manquant refusé',
    (await g(sec.token, `/geographie/dossiers/${idDossier}/district`, {
      method: 'POST', body: {},
    })).s === 400);
} finally {
  if (idDossier) {
    await db.query('DELETE FROM dossiers_districts WHERE dossier_id = ?', [idDossier]);
    for (const t of ['notifications', 'documents', 'dossier_commentaires', 'historique_actions']) {
      await db.query(`DELETE FROM \`${t}\` WHERE dossier_id = ?`, [idDossier]);
    }
    await db.query('DELETE FROM dossiers WHERE id = ?', [idDossier]);
  }
  await db.query(
    'UPDATE compteurs_numerotation SET valeur = ? WHERE cle = ?', [COMPTEUR_AVANT, CLE_COMPTEUR]
  );
  const restant = (await db.query('SELECT COUNT(*) AS n FROM dossiers'))[0].n;
  v('la base retrouve son état de référence', restant === 9, `${restant} dossier(s)`);
  const compteurApres = (await db.query(
    'SELECT valeur FROM compteurs_numerotation WHERE cle = ?', [CLE_COMPTEUR]
  ))[0]?.valeur;
  v('le compteur de numérotation est restitué', compteurApres === COMPTEUR_AVANT,
    `${COMPTEUR_AVANT} -> ${compteurApres}`);
}

await db.pool.end();
console.log(ko === 0 ? '\n  TOUT CONFORME' : `\n  ${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);

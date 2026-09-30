/* Une modification de dossier effaçait sa division.
 *
 * Constaté sur le dossier SECOURS-2026-000001 : orienté automatiquement vers la
 * Division Secours, puis dénudé de sa division par une simple modification. Le
 * dossier disparaissait alors de la file du chef de division et de ses
 * statistiques, tout en traversant le circuit.
 *
 * Cause : `updateDossier` écrivait `division_id || null`. Le champ est
 * optionnel dans le formulaire — l'agent ne le voit pas — donc un PUT qui ne le
 * renvoyait pas le vidait. Le même traitement valait pour l'identité du
 * demandeur.
 *
 * Ce test vérifie les deux moitiés du contrat : un champ NON fourni ne touche
 * rien, un champ fourni à vide efface bien.
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

const DOSSIERS_AVANT = (await db.query('SELECT COUNT(*) AS n FROM dossiers'))[0].n;
/* Le test crée un dossier Secours, donc consomme un numéro. Sans restitution,
   le compteur dériverait à chaque exécution — 40 exécutions et le premier
   dossier réel porterait le numéro 41. La restitution porte sur CE test, dont
   les dossiers n'ont jamais existé en production. */
const CLE_COMPTEUR = 'DOSSIER-4-2026';
const COMPTEUR_AVANT = (await db.query(
  'SELECT valeur FROM compteurs_numerotation WHERE cle = ?', [CLE_COMPTEUR]
))[0]?.valeur || 0;
const secretaire = await login('secretaire@srsp.mg');
const g = async (token, chemin, options = {}) => {
  const r = await fetch(base + chemin, {
    method: options.method || 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return { s: r.status, b: await r.json().catch(() => null) };
};

const lire = async (id) => {
  const r = await db.query(
    `SELECT d.id, d.numero, d.division_id, d.priorite_id, d.objet,
            d.demandeur_nom, d.demandeur_tel, dv.code AS division
     FROM dossiers d LEFT JOIN divisions dv ON dv.id = d.division_id
     WHERE d.id = ?`, [id]
  );
  return r[0];
};

let idDossier = null;
try {
  console.log('=== 1. Mise en place : un dossier routé ===');
  const creation = await g(secretaire.token, '/dossiers', {
    method: 'POST',
    body: {
      type_id: 4, demandeur: 'TEST MODIFICATION REROUTE',
      objet: 'Secours de deces, test de modification',
      date_reception: new Date().toISOString().slice(0, 10),
      priorite_id: 3,
      demandeur_nom: 'TEST', demandeur_tel: '034 00 000 00',
    },
  });
  idDossier = creation.b.id;
  v('dossier créé', creation.s === 201, creation.b.numero);

  const avant = await lire(idDossier);
  v('le dossier est routé à la création', avant.division_id !== null,
    `division ${avant.division_code ?? avant.division}`);
  v('le demandeur est enregistré', avant.demandeur_nom === 'TEST', String(avant.demandeur_nom));

  console.log('\n=== 2. Modification SANS la division : la division doit survivre ===');
  // Le schéma de mise à jour rend division_id facultatif : c'est le cas réel,
  // un formulaire qui ne renvoie que l'objet modifié.
  await g(secretaire.token, `/dossiers/${idDossier}`, {
    method: 'PUT',
    body: {
      type_id: 4,
      objet: 'Objet modifié, division non renvoyée',
      demandeur: 'TEST MODIFICATION REROUTE',
      priorite_id: 3,
    },
  });
  const apres = await lire(idDossier);
  v('la division SURVIT à une modification', apres.division_id === avant.division_id,
    `${avant.division} -> ${apres.division ?? 'PERDUE'}`);
  v('l’objet a bien été modifié', apres.objet === 'Objet modifié, division non renvoyée');
  v('le téléphone du demandeur SURVIT', apres.demandeur_tel === '034 00 000 00',
    String(apres.demandeur_tel));

  console.log('\n=== 3. Deux modifications successives ===');
  for (let i = 1; i <= 3; i++) {
    await g(secretaire.token, `/dossiers/${idDossier}`, {
      method: 'PUT',
      body: {
        type_id: 4, objet: `Objet modifié ${i}`,
        demandeur: 'TEST MODIFICATION REROUTE', priorite_id: 3,
      },
    });
  }
  const apres3 = await lire(idDossier);
  v('la division survit à 3 modifications', apres3.division_id === avant.division_id,
    `division ${apres3.division ?? 'PERDUE'}`);
  v('la dernière modification est bien celle du formulaire',
    apres3.objet === 'Objet modifié 3', apres3.objet);

  console.log('\n=== 4. Un champ fourni À VIDE efface bien ===');
  await g(secretaire.token, `/dossiers/${idDossier}`, {
    method: 'PUT',
    body: {
      type_id: 4, objet: 'Effacement du telephone',
      demandeur: 'TEST MODIFICATION REROUTE', priorite_id: 3,
      demandeur_tel: '',
    },
  });
  const apresVide = await lire(idDossier);
  v('un téléphone effacé devient vide', apresVide.demandeur_tel === null,
    String(apresVide.demandeur_tel));
  v('et la division reste intacte', apresVide.division_id === avant.division_id);

  console.log('\n=== 5. Le dossier reste visible de son chef de division ===');
  const chef = await login('chef.secours@srsp.mg');
  const liste = await g(chef.token, '/dossiers?limit=50');
  const visible = Array.isArray(liste.b) && liste.b.some((d) => d.id === idDossier);
  v('le chef de division voit le dossier', visible,
    visible ? 'présent dans sa file' : 'ABSENT de sa file');

  const dossier = await g(chef.token, `/dossiers/${idDossier}`);
  v('le chef peut l’ouvrir', dossier.s === 200, dossier.b?.division_nom || dossier.b?.message);
} finally {
  if (idDossier) {
    for (const t of ['notifications', 'documents', 'dossier_commentaires', 'historique_actions']) {
      await db.query(`DELETE FROM \`${t}\` WHERE dossier_id = ?`, [idDossier]);
    }
    await db.query('DELETE FROM dossiers WHERE id = ?', [idDossier]);
  }
  // Restitution du compteur : ce dossier n'a jamais existé en production.
  await db.query(
    'UPDATE compteurs_numerotation SET valeur = ? WHERE cle = ?', [COMPTEUR_AVANT, CLE_COMPTEUR]
  );
}

const restant = (await db.query('SELECT COUNT(*) AS n FROM dossiers'))[0].n;
v('la base retrouve son état de référence', restant === DOSSIERS_AVANT, `${restant} dossier(s)`);

const compteurApres = (await db.query(
  'SELECT valeur FROM compteurs_numerotation WHERE cle = ?', [CLE_COMPTEUR]
))[0]?.valeur;
v('le compteur de numérotation est restitué', compteurApres === COMPTEUR_AVANT,
  `${COMPTEUR_AVANT} -> ${compteurApres}`);

await db.pool.end();
console.log(ko === 0 ? '\n  TOUT CONFORME' : `\n  ${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);

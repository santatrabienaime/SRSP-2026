/**
 * Vérifie la création d'un dossier VISA après correction.
 *
 * Trois choses sont éprouvées : le référentiel des agents porte bien
 * `peut_traiter`, le serveur refuse une fiche sans vérificateur ou avec un
 * vérificateur qui ne traite pas les dossiers, et il accepte le vérificateur
 * de la division Visa.
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api';

async function api(method, chemin, { token, corps } = {}) {
  const r = await fetch(`${BASE}${chemin}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corps === undefined ? undefined : JSON.stringify(corps),
  });
  const texte = await r.text();
  let data;
  try { data = JSON.parse(texte); } catch { data = texte; }
  return { status: r.status, data };
}

async function login(identifiant, password = 'Demo123!') {
  const r = await api('POST', '/auth/login', { corps: { identifiant, password } });
  if (!r.data?.token) throw new Error(`Connexion ${identifiant} : ${JSON.stringify(r.data)}`);
  return r.data.token;
}

let reussis = 0;
let echecs = 0;
const ok = (libelle, condition, detail = '') => {
  if (condition) { reussis += 1; console.log(`  OK   ${libelle}${detail ? ` — ${detail}` : ''}`); }
  else { echecs += 1; console.log(`  ECHEC ${libelle}${detail ? ` — ${detail}` : ''}`); }
};

const secretaire = await login('secretaire');
const ref = await api('GET', '/referentiel', { token: secretaire });
const typeVisa = ref.data.types_dossiers.find((t) => t.code === 'VISA');
const sousType = ref.data.sous_types.find((s) => s.type_dossier_id === typeVisa.id);
const priorite = ref.data.priorites[0];

const agents = await api('GET', '/agents', { token: secretaire });
const liste = agents.data || [];

console.log('\n=== 1. Le référentiel des agents ===');
const verifVisa = liste.find((a) => a.username === 'verif.visa');
const chefVisa = liste.find((a) => a.username === 'chef.visa');
const admin = liste.find((a) => a.username === 'admin');
ok('`peut_traiter` est exposé', liste.every((a) => a.peut_traiter !== undefined));
ok('Le vérificateur Visa peut traiter', verifVisa?.peut_traiter === 1,
  `verif.visa=${verifVisa?.peut_traiter}`);
ok('Le chef de division ne traite pas', Number(chefVisa?.peut_traiter) === 0,
  `chef.visa=${chefVisa?.peut_traiter}`);
ok("L'administrateur ne traite pas", Number(admin?.peut_traiter) === 0,
  `admin=${admin?.peut_traiter}`);

const base = {
  type_id: typeVisa.id,
  objet: 'Visa de mariage — vérification de la correction',
  demandeur: 'RAKOTO Jean',
  demandeur_nom: 'RAKOTO',
  demandeur_prenom: 'Jean',
  date_reception: new Date().toISOString().slice(0, 10),
  priorite_id: priorite.id,
  sous_type_id: sousType.id,
  date_heure_reception: `${new Date().toISOString().slice(0, 10)}T09:30:00`,
  origine_presentateur: 'Guichet central',
  comptable_presentateur: 'Comptable RAKOTO',
  annee_reference: new Date().getFullYear(),
  beneficiaire: 'RAKOTO Jean',
  organisme: 'Mairie de Fitovinany',
};

console.log('\n=== 2. Le serveur refuse une fiche incomplète ===');
const sansVerif = await api('POST', '/dossiers', { token: secretaire, corps: base });
ok('Sans vérificateur : 422', sansVerif.status === 422, String(sansVerif.status));
ok('Le message nomme le vérificateur', /vérificateur/i.test(sansVerif.data?.message || ''),
  sansVerif.data?.message);

const avecChef = await api('POST', '/dossiers', {
  token: secretaire,
  corps: { ...base, verificateur_id: chefVisa?.id },
});
ok('Avec le chef de division : 422', avecChef.status === 422, String(avecChef.status));
ok('Le message dit pourquoi', /agent de traitement/i.test(avecChef.data?.message || ''),
  avecChef.data?.message);

const avecAdmin = await api('POST', '/dossiers', {
  token: secretaire,
  corps: { ...base, verificateur_id: admin?.id },
});
ok("Avec l'administrateur : 422", avecAdmin.status === 422, String(avecAdmin.status));

console.log('\n=== 3. La fiche complète est acceptée ===');
const complete = await api('POST', '/dossiers', {
  token: secretaire,
  corps: { ...base, verificateur_id: verifVisa?.id },
});
ok('Création : 201', complete.status === 201,
  `${complete.status} ${complete.data?.numero || complete.data?.message || ''}`);

if (complete.status === 201) {
  const detail = await api('GET', `/dossiers/${complete.data.id}`, { token: secretaire });
  ok('Vérificateur enregistré', Number(detail.data?.verificateur_id) === Number(verifVisa?.id),
    `${detail.data?.verificateur_nom || ''} ${detail.data?.verificateur_prenom || ''}`);
  ok('Type d\'acte enregistré', Boolean(detail.data?.type_acte), detail.data?.type_acte);
}

console.log(`\nRésultat : ${reussis} réussite(s), ${echecs} échec(s).`);
process.exit(echecs ? 1 : 0);

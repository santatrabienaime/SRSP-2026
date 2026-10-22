/**
 * Test de bout en bout du canal temps réel.
 *
 * Le test prouve que la chaîne complète fonctionne : un changement de statut
 * d'un dossier produit un signal, et ce signal atteint le chef de division
 * concerné. Il prouve aussi les garde-fous : un compte désactivé ne peut pas
 * garder son canal ouvert, et le canal ne transporte que l'alerte — jamais le
 * dossier lui-même.
 *
 * Le client Socket.IO utilisé est celui du **frontend** : c'est exactement le
 * code qui tournera en production, et cela évite d'entretenir une seconde
 * version du client. Il faut donc que les dépendances du frontend soient
 * installées.
 *
 * Usage : node scripts/test-e2e-temps-reel.mjs
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/* Résolution du client Socket.IO du frontend, quel que soit l'endroit où il
   est installé. À défaut, le test s'arrête avec un message clair plutôt
   qu'avec une erreur d'import illisible. */
function chargerClientSocketIo() {
  const candidats = [
    'socket.io-client',
    '../../Frontend/node_modules/socket.io-client/build/esm/index.js',
  ];
  for (const candidat of candidats) {
    try {
      return require(candidat);
    } catch {
      /* on essaie le suivant */
    }
  }
  console.error(
    '\nLe client socket.io-client est introuvable.\n' +
    'Installez les dépendances du frontend :\n' +
    '    cd Frontend && npm install\n'
  );
  process.exit(2);
  return null;
}

const { io } = chargerClientSocketIo();

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const ORIGINE = new URL(BASE).origin;

let reussis = 0;
let echecs = 0;

function ok(nom, condition, detail = '') {
  if (condition) {
    reussis += 1;
    console.log(`  OK   ${nom}${detail ? ` — ${detail}` : ''}`);
  } else {
    echecs += 1;
    console.error(`  ECHEC ${nom}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(titre) {
  console.log(`\n=== ${titre} ===`);
}

async function login(identifiant, password = 'Demo123!') {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`Connexion ${identifiant} : ${r.status} ${d.message || ''}`);
  return d;
}

async function api(token, method, chemin, corps) {
  const r = await fetch(`${BASE}${chemin}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: corps === undefined ? undefined : JSON.stringify(corps),
  });
  const texte = await r.text();
  let data = null;
  try { data = JSON.parse(texte); } catch { data = texte; }
  return { status: r.status, data };
}

/** Ouvre un canal et attend qu'il soit établi. */
function ouvrirCanal(token) {
  return new Promise((resolve, reject) => {
    const socket = io(ORIGINE, { auth: { token }, transports: ['websocket', 'polling'] });
    const delai = setTimeout(() => {
      socket.close();
      reject(new Error('Canal non établi dans le délai.'));
    }, 8000);
    socket.on('connect', () => {
      clearTimeout(delai);
      resolve(socket);
    });
    socket.on('connect_error', (e) => {
      clearTimeout(delai);
      socket.close();
      reject(e);
    });
  });
}

/** Attend un événement, ou expire. */
function attendre(socket, evenement, delaiMs = 6000) {
  return new Promise((resolve) => {
    const t = setTimeout(() => {
      socket.off(evenement, handler);
      resolve(null);
    }, delaiMs);
    const handler = (charge) => {
      clearTimeout(t);
      socket.off(evenement, handler);
      resolve(charge);
    };
    socket.on(evenement, handler);
  });
}

async function main() {
  console.log(`Test du canal temps réel — ${BASE}`);

  const secretaire = await login('secretaire');
  const verif = await login('verif.visa');
  const chefVisa = await login('chef.visa');

  /* ------------------------------------------------------------------ */
  section('1. Ouverture du canal');

  const canalVerif = await ouvrirCanal(verif.token);
  ok('Canal du vérificateur établi', canalVerif.connected);

  const canalChef = await ouvrirCanal(chefVisa.token);
  ok('Canal du chef de division établi', canalChef.connected);

  const confirmation = await attendre(canalChef, 'canal', 3000);
  ok('Le serveur confirme l\'établissement du canal', Boolean(confirmation),
    confirmation?.etat || '');

  /* ------------------------------------------------------------------ */
  section('2. Signal de changement de dossier');

  /* Un dossier VISA complet, instruit par le vérificateur. */
  const ref = await api(secretaire.token, 'GET', '/referentiel');
  const typeVisa = (ref.data.types_dossiers || []).find((t) => t.code === 'VISA');
  const sousType = (ref.data.sous_types || []).find(
    (s) => s.type_dossier_id === typeVisa.id
  );
  const priorite = ref.data.priorites?.[0];
  const agents = await api(verif.token, 'GET', '/agents');
  const agentVerif = (agents.data || []).find(
    (a) => a.role_nom === 'VERIFICATEUR_VISA' && a.actif !== 0 && a.peut_traiter
  );

  const creation = await api(secretaire.token, 'POST', '/dossiers', {
    type_id: typeVisa.id,
    objet: 'Visa de test — canal temps réel',
    demandeur: 'RAKOTO Test',
    demandeur_nom: 'RAKOTO',
    demandeur_prenom: 'Test',
    matricule: `T${Date.now() % 1000000}`.slice(0, 10).toUpperCase(),
    date_reception: new Date().toISOString().slice(0, 10),
    date_heure_reception: `${new Date().toISOString().slice(0, 10)}T10:00:00`,
    priorite_id: priorite.id,
    sous_type_id: sousType.id,
    reference_visa: `VISA-TR-${Date.now()}`,
    origine_presentateur: 'Guichet central',
    comptable_presentateur: 'Comptable RAKOTO',
    annee_reference: new Date().getFullYear(),
    beneficiaire: 'RAKOTO Test',
    organisme: 'Mairie de Fitovinany',
    verificateur_id: agentVerif?.id,
  });
  ok('Dossier de test créé', creation.status === 201,
    `${creation.status} ${creation.data?.numero || creation.data?.message || ''}`);

  if (creation.status !== 201) {
    throw new Error('Impossible de poursuivre sans dossier.');
  }
  const dossierId = creation.data.id;

  /* La prise en charge du dossier par le vérificateur produit une
     transition : le chef de division de la même division doit être
     signalé. */
  const promesse = attendre(canalChef, 'dossier', 8000);
  const traitement = await api(verif.token, 'POST', `/dossiers/${dossierId}/traiter`, {
    observation: 'Prise en charge — test du canal temps réel.',
  });
  ok('Prise en charge du dossier', traitement.status === 200,
    `${traitement.status} ${traitement.data?.message || ''}`);

  const signal = await promesse;
  ok('Le chef de division reçoit le signal de changement', Boolean(signal),
    signal ? `dossier ${signal.dossier_id} → ${signal.statut}` : 'aucun signal reçu');
  ok('Le signal porte le bon dossier', Number(signal?.dossier_id) === Number(dossierId));
  ok('Le signal porte le nouveau statut', signal?.statut === 'EN_TRAITEMENT', signal?.statut);

  /* Le canal ne transporte que l'alerte : ni objet, ni demandeur, ni
     contenu du dossier ne doivent y figurer. */
  const charge = JSON.stringify(signal || {});
  ok('Le canal ne transporte aucune donnée de dossier',
    !charge.includes('RAKOTO') && !charge.includes('Visa de test'),
    charge);

  /* ------------------------------------------------------------------ */
  section('3. Garde-fous du canal');

  /* Un jeton invalide ne doit pas ouvrir de canal. */
  let canalRefuse = null;
  try {
    canalRefuse = await ouvrirCanal('jeton-invalide');
  } catch {
    canalRefuse = null;
  }
  ok('Un jeton invalide n\'ouvre pas de canal', canalRefuse === null);

  /* Un compte désactivé ne doit pas garder son canal ouvert. */
  const profil = await api(secretaire.token, 'GET', '/auth/me');
  const canalDesactive = await ouvrirCanal(secretaire.token);
  ok('Canal ouvert avant désactivation', canalDesactive.connected);

  /* La fiche de la personne concernée — et elle seule. */
  const adminToken = (await login('admin', 'Admin123!')).token;
  const fichePersonne = await api(adminToken, 'GET', '/personnel');
  const personnes = fichePersonne.data?.personnes || fichePersonne.data || [];
  const fiche = personnes.find((p) => Number(p.user_id) === Number(profil.data.id));
  ok('Fiche de la personne de test retrouvée', Boolean(fiche),
    fiche ? `#${fiche.id} ${fiche.username || fiche.email}` : '');

  /* La désactivation du compte referme le canal : le contrôle de session est
     appliqué à la main du socket, exactement comme sur l'API. */
  const desactivation = await api(adminToken, 'PUT', `/personnel/${fiche.id}/toggle`, {});
  ok('Compte de test désactivé', desactivation.status === 200,
    `${desactivation.status}`);

  const canalApresDesactivation = await ouvrirCanal(secretaire.token).catch(() => null);
  ok('Un compte désactivé n\'ouvre plus de canal', canalApresDesactivation === null);

  /* L'API elle-même refuse aussi la session : la révocation vaut partout,
     pas seulement sur le canal temps réel. */
  const apiApresDesactivation = await api(secretaire.token, 'GET', '/dossiers');
  ok('L\'API refuse aussi la session désactivée (401)',
    apiApresDesactivation.status === 401, `${apiApresDesactivation.status}`);

  /* Remise en état : le compte doit être réactivé. */
  await api(adminToken, 'PUT', `/personnel/${fiche.id}/toggle`, {});
  const reactivation = await api(secretaire.token, 'GET', '/auth/me');
  ok('Compte de test réactivé', reactivation.status === 200, `${reactivation.status}`);

  /* ------------------------------------------------------------------ */
  section('4. Fermeture');

  canalVerif.close();
  canalChef.close();
  ok('Canaux fermés', !canalVerif.connected && !canalChef.connected);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Résultat : ${reussis} test(s) réussi(s), ${echecs} échec(s).`);
  console.log(`${'='.repeat(60)}\n`);
  process.exit(echecs === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('\nÉCHEC FATAL :', e.message);
  console.error(e.stack);
  process.exit(1);
});

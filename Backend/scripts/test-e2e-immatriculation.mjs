/**
 * Test de bout en bout du module d'immatriculation de la Coordination.
 *
 * Le cahier (§ 11.2) confie à la Coordination : l'attribution des numéros
 * d'immatriculation, l'insertion des nouveaux arrivants dans les systèmes de
 * paie et de pension, les changements de mode de paiement, et les volumes.
 *
 * Ce qui doit **échouer** est autant éprouvé que ce qui doit réussir : le
 * doublon de CIN, le doublon de matricule, le virement sans compte, et le
 * changement de paiement sans motif.
 *
 * Usage : node scripts/test-e2e-immatriculation.mjs
 */

const BASE = process.env.API_URL || 'http://localhost:5000/api';

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
  let data = null;
  try { data = JSON.parse(texte); } catch { data = texte; }
  return { status: r.status, data };
}

async function login(identifiant, password = 'Demo123!') {
  const r = await api('POST', '/auth/login', { corps: { identifiant, password } });
  if (r.status !== 200) throw new Error(`Connexion ${identifiant} : ${r.status}`);
  return r.data;
}

let compteur = 0;
const suffixe = () => {
  compteur += 1;
  return `${Date.now() % 100000}${compteur}`;
};

async function main() {
  console.log(`Test du module d'immatriculation — ${BASE}`);

  const coordination = await login('coordinatrice');
  const secretaire = await login('secretaire');

  /* ------------------------------------------------------------------ */
  section('1. Immatriculation');

  const cin = `CIN${suffixe()}`;
  const creation = await api('POST', '/immatriculations', {
    token: coordination.token,
    corps: {
      nom: 'RABE',
      prenom: 'Jean',
      cin,
      date_naissance: '1990-05-12',
      corps: 'Administrateur',
      grade: 'A3',
      indice: 450,
      date_entree: '2026-11-01',
      observations: 'Nouvel agent public de la région.',
    },
  });
  ok('La demande d\'immatriculation est enregistrée', creation.status === 201,
    `${creation.status} ${creation.data?.message || ''}`);
  ok('Une référence est attribuée', Boolean(creation.data?.reference),
    creation.data?.reference);
  const immaId = creation.data?.id;

  /* Le doublon de CIN : signalé avant l'attribution, pas découvert à la paie. */
  const doublonCin = await api('POST', '/immatriculations', {
    token: coordination.token,
    corps: { nom: 'RABE', prenom: 'Pierre', cin },
  });
  ok('Un CIN déjà connu est refusé (409)', doublonCin.status === 409,
    `${doublonCin.status} ${doublonCin.data?.message || ''}`);

  /* Le matricule est attribué par la plateforme : il ne se saisit pas à la
     création. Le doublon de matricule se provoque donc en **modification**,
     quand la coordination attribue à tort la référence d'un autre dossier. */
  const seconde = await api('POST', '/immatriculations', {
    token: coordination.token,
    corps: { nom: 'TEST', prenom: 'Doublon', cin: `CIN${suffixe()}` },
  });
  ok('Une seconde immatriculation est créée', seconde.status === 201,
    `${seconde.status}`);

  const doublonMatricule = await api('PUT', `/immatriculations/${seconde.data?.id}`, {
    token: coordination.token,
    corps: { matricule: creation.data?.reference },
  });
  ok('Un matricule déjà attribué est refusé (409)', doublonMatricule.status === 409,
    `${doublonMatricule.status} ${doublonMatricule.data?.message || ''}`);

  const modification = await api('PUT', `/immatriculations/${immaId}`, {
    token: coordination.token,
    corps: { corps: 'Secrétaire administratif' },
  });
  ok('L\'immatriculation se modifie', modification.status === 200,
    `${modification.status}`);

  const liste = await api('GET', '/immatriculations', { token: coordination.token });
  ok('Les immatriculations sont listables', liste.status === 200,
    `${(liste.data || []).length} ligne(s)`);
  ok('L\'immatriculation enregistrée figure dans la liste',
    (liste.data || []).some((i) => i.id === immaId));

  const detail = await api('GET', `/immatriculations/${immaId}`, { token: coordination.token });
  ok('La fiche est consultable', detail.status === 200, `${detail.status}`);
  ok('La référence attribuée est conservée',
    Boolean(detail.data?.matricule), detail.data?.matricule);

  /* ------------------------------------------------------------------ */
  section('2. Cloisonnement du rôle');

  const accesSecretaire = await api('GET', '/immatriculations', { token: secretaire.token });
  ok('Un profil sans la permission n\'accède pas aux immatriculations (403)',
    accesSecretaire.status === 403, `${accesSecretaire.status}`);

  const accesAnonyme = await api('GET', '/immatriculations');
  ok('Sans jeton, l\'accès est refusé (401)', accesAnonyme.status === 401,
    `${accesAnonyme.status}`);

  /* ------------------------------------------------------------------ */
  section('3. Insertion en paie');

  const insertion = await api('POST', `/immatriculations/${immaId}/insertion`, {
    token: coordination.token,
    corps: {
      immatriculation_id: immaId,
      matricule_augure: `AUG${suffixe()}`,
      situation_familiale: 'Marié',
      adresse: 'Ambodiaplay, Manakara',
      telephone: '0321234567',
      date_naissance: '1990-05-12',
      indice_base: 450,
      salaire_base: 850000,
      statut: 'A_INSERER',
    },
  });
  ok('L\'insertion en paie est enregistrée', insertion.status === 201,
    `${insertion.status} ${insertion.data?.message || ''}`);

  const apresInsertion = await api('GET', `/immatriculations/${immaId}`, {
    token: coordination.token,
  });
  ok('L\'insertion est rattachée à l\'immatriculation',
    Boolean(apresInsertion.data?.insertion),
    apresInsertion.data?.insertion?.statut);

  /* ------------------------------------------------------------------ */
  section('4. Changement de mode de paiement');

  const sansMotif = await api('POST', `/immatriculations/${immaId}/paiement`, {
    token: coordination.token,
    corps: { immatriculation_id: immaId, mode: 'VIREMENT' },
  });
  ok('Un changement sans motif est refusé (400)', sansMotif.status === 400,
    `${sansMotif.status}`);

  const virementSansCompte = await api('POST', `/immatriculations/${immaId}/paiement`, {
    token: coordination.token,
    corps: {
      immatriculation_id: immaId,
      mode: 'VIREMENT',
      motif: 'Demande de virement sur un nouveau compte bancaire.',
    },
  });
  ok('Un virement sans numéro de compte est refusé (422)',
    virementSansCompte.status === 422,
    `${virementSansCompte.status} ${virementSansCompte.data?.message || ''}`);

  const changement = await api('POST', `/immatriculations/${immaId}/paiement`, {
    token: coordination.token,
    corps: {
      immatriculation_id: immaId,
      mode: 'VIREMENT',
      banque: 'BNI Madagascar',
      compte_bancaire: '00012 34567 8901234',
      motif: 'Demande de virement sur un nouveau compte bancaire.',
      pieces_verifiees: true,
    },
  });
  ok('Le changement de mode de paiement est enregistré', changement.status === 201,
    `${changement.status} ${changement.data?.message || ''}`);

  const apresChangement = await api('GET', `/immatriculations/${immaId}`, {
    token: coordination.token,
  });
  ok('Le changement est rattaché à l\'immatriculation',
    (apresChangement.data?.paiements || []).length > 0,
    `${(apresChangement.data?.paiements || []).length} demande(s)`);
  ok('Le motif est conservé',
    Boolean(apresChangement.data?.paiements?.[0]?.motif),
    apresChangement.data?.paiements?.[0]?.motif);

  /* ------------------------------------------------------------------ */
  section('5. Volumes');

  const volumes = await api('GET', '/immatriculations/volumes', { token: coordination.token });
  ok('Les volumes sont calculés', volumes.status === 200, `${volumes.status}`);
  ok('Les volumes par type de demande sont présents',
    (volumes.data?.par_type || []).length > 0,
    (volumes.data?.par_type || []).map((v) => `${v.type}: ${v.total}`).join(', '));

  /* Les volumes sont un tableau de bord d'activité : ils sont ouverts à
     qui sait lire les statistiques, pas seulement à la coordination. */
  const chefService = await login('chef.service');
  const volumesSecretaire = await api('GET', '/immatriculations/volumes', {
    token: chefService.token,
  });
  ok('Les volumes sont lisibles par un profil de pilotage',
    volumesSecretaire.status === 200, `${volumesSecretaire.status}`);

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

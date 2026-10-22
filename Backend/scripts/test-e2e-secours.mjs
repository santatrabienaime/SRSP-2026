/**
 * Le circuit Secours, de bout en bout.
 *
 * Le cahier (§ 10) décrit cinq étapes du mandat : le visa du contrôle
 * financier, les références du logiciel Secours, l'état d'émargement, la
 * signature de l'ordonnateur, le cachet — puis l'archivage de la copie
 * signée.
 *
 * Ces cinq étapes existaient **sur le papier seulement**. Les routes
 * exigeaient un droit que aucun rôle ne portait : le serveur répondait 403 à
 * tout le monde, et l'écran montrait un mandat que personne ne pouvait
 * faire avancer. Aucune campagne ne le voyait : aucune ne parcourait le
 * circuit.
 *
 * Ce test le parcourt, étape par étape, avec le profil qui a le droit de
 * chaque faire. Il échoue si une étape redevient inaccessible.
 *
 * Usage : node scripts/test-e2e-secours.mjs
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

const suffixe = Math.floor(Date.now() % 100000);

const secretaire = await login('secretaire');
const chefSecours = await login('chef.secours');
const chargeSecours = await login('charge.secours');
const verifSolde = await login('verif.solde');

/* ------------------------------------------------------------------ */
section('0. Le dossier Secours et son mandatement');

const ref = await api('GET', '/referentiel', { token: secretaire.token });
const typeSecours = (ref.data.types_dossiers || []).find((t) => t.code === 'SECOURS');
const priorite = ref.data.priorites?.[0];

/* La Division Secours n'a pas de sous-type : son circuit est l'onglet
   *Secours* de la fiche, pas une opération parmi d'autres. */
const creation = await api('POST', '/dossiers', {
  token: secretaire.token,
  corps: {
    type_id: typeSecours.id,
    objet: 'Secours de décès — test E2E',
    demandeur: 'TEST Décès',
    demandeur_nom: 'TEST',
    demandeur_prenom: 'Décès',
    matricule: `TD${suffixe}`,
    date_reception: new Date().toISOString().slice(0, 10),
    priorite_id: priorite.id,
  },
});
ok('Dossier Secours créé', creation.status === 201,
  `${creation.status} ${creation.data?.numero || creation.data?.message || ''}`);
const idDossier = creation.data?.id;

const mandatement = await api('POST', `/dossiers/${idDossier}/mandatement`, {
  token: chefSecours.token,
  corps: {
    montant_total: 1000000,
    beneficiaires: [
      { nom: 'TEST Bénéficiaire 1', quote_part: 60 },
      { nom: 'TEST Bénéficiaire 2', quote_part: 40 },
    ],
  },
});
ok('Le mandatement est préparé par le chef de division',
  mandatement.status === 201 || mandatement.status === 200,
  `${mandatement.status} ${mandatement.data?.message || ''}`);

/* ------------------------------------------------------------------ */
section('1. Le visa du contrôle financier');

const visa = await api('POST', `/dossiers/${idDossier}/secours/visa`, {
  token: chefSecours.token,
  corps: {
    numero_visa: `CF/${suffixe}`,
    signe_par: 'TEST Contrôleur Financier',
    date_visa: new Date().toISOString().slice(0, 10),
    commentaire: 'Visa de test.',
  },
});
ok('Le visa du contrôle financier est enregistré', visa.status === 201,
  `${visa.status} ${visa.data?.message || ''}`);

const visaRefuse = await api('POST', `/dossiers/${idDossier}/secours/visa`, {
  token: verifSolde.token,
  corps: { numero_visa: `CF/X${suffixe}`, signe_par: 'X', date_visa: new Date().toISOString().slice(0, 10) },
});
ok('Le visa est refusé à un profil d’une autre division (403)',
  visaRefuse.status === 403, `${visaRefuse.status}`);

/* ------------------------------------------------------------------ */
section('2. Les références du logiciel Secours et l’état d’émargement');

const references = await api('GET', `/dossiers/${idDossier}/secours/references`, {
  token: chefSecours.token,
});
const listeReferences = references.data?.references || [];
ok('Les références du logiciel Secours sont listées', references.status === 200,
  `${listeReferences.length} référence(s)`);

const premiereReference = listeReferences[0]?.code;
if (premiereReference) {
  const marquee = await api('POST', `/dossiers/${idDossier}/secours/references/${premiereReference}`, {
    token: chefSecours.token,
    corps: {},
  });
  ok('Une référence est reportée', marquee.status === 200 || marquee.status === 201,
    `${marquee.status} ${marquee.data?.message || ''}`);
} else {
  ok('Une référence est reportée', false, 'aucune référence à reporter');
}

const emargement = await api('POST', `/dossiers/${idDossier}/secours/emargement`, {
  token: chefSecours.token,
  corps: {},
});
ok('L’état d’émargement est généré', emargement.status === 200 || emargement.status === 201,
  `${emargement.status} ${emargement.data?.message || ''}`);

const lectureEmargement = await api('GET', `/dossiers/${idDossier}/secours/emargement`, {
  token: chefSecours.token,
});
ok('L’état d’émargement est relu', lectureEmargement.status === 200,
  `${lectureEmargement.data?.total ?? 0} bénéficiaire(s), `
  + `${lectureEmargement.data?.signs ?? 0} signé(s)`);

/* ------------------------------------------------------------------ */
section('3. La signature de l’ordonnateur');

const signature = await api('POST', `/dossiers/${idDossier}/secours/signature`, {
  token: chefSecours.token,
  corps: {
    reference_signature: `SIG/${suffixe}`,
    observations: 'Signature portée sur la pièce.',
  },
});
ok('La signature de l’ordonnateur est enregistrée', signature.status === 201 || signature.status === 200,
  `${signature.status} ${signature.data?.message || ''}`);

const signatureRefusee = await api('POST', `/dossiers/${idDossier}/secours/signature`, {
  token: verifSolde.token,
  corps: { reference_signature: `SIG/X${suffixe}` },
});
ok('La signature est refusée à un profil d’une autre division (403)',
  signatureRefusee.status === 403, `${signatureRefusee.status}`);

/* ------------------------------------------------------------------ */
section('4. L’archivage de la copie signée');

const archivage = await api('POST', `/dossiers/${idDossier}/secours/signature/archiver`, {
  token: chefSecours.token,
  corps: {},
});
ok('La copie signée est archivée', archivage.status === 200,
  `${archivage.status} ${archivage.data?.message || ''}`);

const lectureSignature = await api('GET', `/dossiers/${idDossier}/secours/signature`, {
  token: chefSecours.token,
});
ok('La date d’archivage de la copie signée est conservée',
  Boolean(lectureSignature.data?.archive_le),
  lectureSignature.data?.archive_le || '—');

const archivageRefuse = await api('POST', `/dossiers/${idDossier}/secours/signature/archiver`, {
  token: verifSolde.token,
  corps: {},
});
ok('L’archivage est refusé à un profil d’une autre division (403)',
  archivageRefuse.status === 403, `${archivageRefuse.status}`);

/* ------------------------------------------------------------------ */
section('5. Le cachet de l’ordonnateur');

const cachet = await api('POST', `/dossiers/${idDossier}/secours/cachet`, {
  token: chargeSecours.token,
  corps: {
    titre_ordonnateur: 'Chef de Division Secours',
    nom_ordonnateur: 'TEST Ordonneur',
    date_cachet: new Date().toISOString().slice(0, 10),
    observations: 'Cachet apposé.',
  },
});
ok('Le cachet est apposé par le chargé de Secours', cachet.status === 200 || cachet.status === 201,
  `${cachet.status} ${cachet.data?.message || ''}`);

const lectureCachet = await api('GET', `/dossiers/${idDossier}/secours/cachet`, {
  token: chefSecours.token,
});
ok('Le cachet est relu', lectureCachet.status === 200,
  lectureCachet.data?.titre_ordonnateur || '');

/* ------------------------------------------------------------------ */
section('6. L’état d’ensemble du mandat');

const etat = await api('GET', `/dossiers/${idDossier}/secours/etat`, {
  token: chefSecours.token,
});
ok('L’état du mandat est complet', etat.status === 200, `${etat.status}`);
ok('Le visa est présent', Boolean(etat.data?.visa));
ok('L’état d’émargement est présent', Boolean(etat.data?.emargement));
ok('La signature est présente', Boolean(etat.data?.signature));
ok('Le cachet est présent', Boolean(etat.data?.cachet));

console.log(`\n${'='.repeat(60)}`);
console.log(`Résultat : ${reussis} test(s) réussi(s), ${echecs} échec(s).`);
console.log(`${'='.repeat(60)}\n`);

process.exit(echecs === 0 ? 0 : 1);

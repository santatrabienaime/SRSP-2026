/**
 * Test de bout en bout de la remontée des dossiers bloqués.
 *
 * Le scénario du cahier : un chef de division constate qu'un dossier ne peut
 * pas avancer, il le remonte ; le chef de service en est informé, le prend en
 * charge et le referme par une décision écrite. Le dossier, lui, n'a pas
 * changé de statut — le signalement porte la difficulté, pas le circuit.
 *
 * Le test vérifie aussi ce qui DOIT échouer :
 *   - un agent qui n'a pas le droit de signaler (403) ;
 *   - un second signalement ouvert par le même auteur sur le même dossier (409) ;
 *   - une résolution sans texte (422) ;
 *   - la résolution par un chef de division, qui n'arbitre pas au-dessus des
 *     divisions (403) ;
 *   - un signalement refermé ne se referme pas deux fois (409) ;
 *   - un chef de division ne voit pas les signalements d'une autre division.
 *
 * Usage : node scripts/test-e2e-signalements.mjs
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

async function login(identifiant, password = 'Demo123!') {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Connexion ${identifiant} : ${r.status} ${data.message || ''}`);
  return { token: data.token, user: data.user };
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
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

let compteur = 0;
function matriculeTest(prefix = 'S') {
  compteur += 1;
  return `${prefix}${(Date.now() % 1e7).toString(36).toUpperCase()}${compteur}`.slice(0, 10);
}

/** Crée un dossier du type demandé, prêt à être signalé. */
async function creerDossier(secretaire, typeCode) {
  const ref = await api(secretaire.token, 'GET', '/referentiel');
  const type = ref.data.types_dossiers.find((t) => t.code === typeCode);
  if (!type) throw new Error(`Type ${typeCode} absent du référentiel.`);

  const sousType = (ref.data.sous_types || []).find((s) => s.type_dossier_id === type.id);
  const priorite = ref.data.priorites[0];

  const corps = {
    type_id: type.id,
    objet: `Dossier de test — signalement ${typeCode}`,
    demandeur: 'RAKOTO Signalement',
    demandeur_nom: 'RAKOTO',
    demandeur_prenom: 'Signalement',
    matricule: matriculeTest(typeCode[0]),
    date_reception: new Date().toISOString().slice(0, 10),
    priorite_id: priorite.id,
    sous_type_id: sousType?.id ?? null,
  };

  /* Le VISA exige sa fiche de réception complète. */
  if (typeCode === 'VISA') {
    const agents = await api(secretaire.token, 'GET', '/agents');
    const verificateur = (agents.data || []).find(
      (a) => a.role_nom === 'VERIFICATEUR_VISA' && a.actif !== 0 && a.peut_traiter
    );
    Object.assign(corps, {
      date_heure_reception: `${new Date().toISOString().slice(0, 10)}T09:00:00`,
      origine_presentateur: 'Guichet central',
      comptable_presentateur: 'Comptable RAKOTO',
      annee_reference: new Date().getFullYear(),
      verificateur_id: verificateur?.id,
    });
  }

  const creation = await api(secretaire.token, 'POST', '/dossiers', corps);
  if (creation.status !== 201) {
    throw new Error(`Création ${typeCode} impossible : ${creation.status} ${creation.data?.message || ''}`);
  }
  return creation.data;
}

async function main() {
  console.log(`Test des signalements — ${BASE}`);

  section('1. Connexions');
  const secretaire = await login('secretaire');
  const chefVisa = await login('chef.visa');
  const chefSolde = await login('chef.solde');
  const verifVisa = await login('verif.visa');
  const chefService = await login('chef.service');
  const admin = await login('admin', 'Admin123!');
  ok('Connexions établies', [
    secretaire, chefVisa, chefSolde, verifVisa, chefService, admin,
  ].every((c) => Boolean(c.token)));

  section('2. Un dossier bloqué est signalé par son chef de division');
  const visa = await creerDossier(secretaire, 'VISA');
  ok('Dossier VISA de test créé', Boolean(visa.id), visa.numero);
  const avantSignalement = await api(verifVisa.token, 'GET', `/dossiers/${visa.id}`);
  const statutInitial = avantSignalement.data?.statut_code;

  const motif = 'Pièce d’état civil manquante, le demandeur ne peut pas être joint.';
  const ouverture = await api(chefVisa.token, 'POST', `/dossiers/${visa.id}/signalements`, {
    type: 'BLOCAGE',
    priorite: 'HAUTE',
    motif,
  });
  ok('Ouverture du signalement : 201', ouverture.status === 201,
    `${ouverture.status} ${ouverture.data?.message || ''}`);
  const signalementId = ouverture.data?.id;
  ok('Statut initial OUVERT', ouverture.data?.statut === 'OUVERT', ouverture.data?.statut);
  ok('Dossier rattaché', Number(ouverture.data?.dossier_id) === Number(visa.id));
  ok('Division déduite du dossier', Boolean(ouverture.data?.division_id),
    String(ouverture.data?.division_id));

  section('3. Ce qui doit être refusé');
  const doublon = await api(chefVisa.token, 'POST', `/dossiers/${visa.id}/signalements`, {
    type: 'BLOCAGE',
    motif: 'Second signalement du même auteur sur le même dossier.',
  });
  ok('Second signalement ouvert par le même auteur : 409', doublon.status === 409,
    `${doublon.status} ${doublon.data?.message || ''}`);

  const parAgent = await api(verifVisa.token, 'POST', `/dossiers/${visa.id}/signalements`, {
    type: 'BLOCAGE',
    motif: 'Un agent de traitement ne remonte pas à la hiérarchie.',
  });
  ok('Signalement par un agent sans droit : 403', parAgent.status === 403,
    `${parAgent.status}`);

  const motifCourt = await api(chefVisa.token, 'POST', `/dossiers/${visa.id}/signalements`, {
    type: 'BLOCAGE',
    motif: 'court',
  });
  /* Le schéma Joi répond 400 ; les règles métier répondent 422. */
  ok('Motif trop court : 400', motifCourt.status === 400, `${motifCourt.status}`);

  const resolutionParChef = await api(chefVisa.token, 'PUT', `/signalements/${signalementId}/resoudre`, {
    statut: 'RESOLU',
    resolution: 'Le chef de division ne referme pas son propre signalement.',
  });
  ok('Résolution par un chef de division : 403', resolutionParChef.status === 403,
    `${resolutionParChef.status}`);

  section('4. La hiérarchie voit et prend en charge');
  const fileChefService = await api(chefService.token, 'GET', '/signalements?statut=OUVERT');
  const dansLaFile = (fileChefService.data || []).some((s) => s.id === signalementId);
  ok('Le signalement est dans la file du chef de service', dansLaFile,
    `${(fileChefService.data || []).length} signalement(s) ouvert(s)`);

  const fileAutreDivision = await api(chefSolde.token, 'GET', '/signalements');
  ok('Un chef de division ne voit pas la file d’une autre division',
    !(fileAutreDivision.data || []).some((s) => s.id === signalementId));

  const prise = await api(chefService.token, 'PUT', `/signalements/${signalementId}/prendre`, {});
  ok('Prise en charge : 200', prise.status === 200, `${prise.status} ${prise.data?.message || ''}`);
  ok('Statut EN_COURS', prise.data?.statut === 'EN_COURS', prise.data?.statut);
  ok('Traiteur enregistré', Boolean(prise.data?.traite_par), prise.data?.traiteur_username);

  const reprise = await api(chefService.token, 'PUT', `/signalements/${signalementId}/prendre`, {});
  ok('Prise en charge une seconde fois : 409', reprise.status === 409, `${reprise.status}`);

  section('5. La résolution est écrite et tracée');
  const resolutionCourte = await api(chefService.token, 'PUT', `/signalements/${signalementId}/resoudre`, {
    statut: 'RESOLU',
    resolution: 'réglé',
  });
  ok('Résolution sans texte suffisant : 400', resolutionCourte.status === 400,
    `${resolutionCourte.status}`);

  const resolution = await api(chefService.token, 'PUT', `/signalements/${signalementId}/resoudre`, {
    statut: 'RESOLU',
    resolution: 'Pièce reconstituée par la mairie et versée au dossier ; le dossier reprend son circuit.',
  });
  ok('Résolution : 200', resolution.status === 200, `${resolution.status} ${resolution.data?.message || ''}`);
  ok('Statut RESOLU', resolution.data?.statut === 'RESOLU', resolution.data?.statut);
  ok('Résolution enregistrée', Boolean(resolution.data?.resolution), resolution.data?.resolution);
  ok('Date de résolution posée', Boolean(resolution.data?.date_resolution));

  const secondeResolution = await api(chefService.token, 'PUT', `/signalements/${signalementId}/resoudre`, {
    statut: 'RESOLU',
    resolution: 'Une seconde résolution ne doit pas écraser la première.',
  });
  ok('Résolution d’un signalement déjà refermé : 409', secondeResolution.status === 409,
    `${secondeResolution.status}`);

  section('6. Le dossier et ses traces');
  const lectureDossier = await api(verifVisa.token, 'GET', `/dossiers/${visa.id}/signalements`);
  ok('Les signalements du dossier sont lisibles avec le dossier',
    (lectureDossier.data || []).some((s) => s.id === signalementId),
    `${(lectureDossier.data || []).length}`);

  const historique = await api(admin.token, 'GET', `/historique?dossier_id=${visa.id}`);
  const actions = (historique.data?.actions || []).map((a) => a.action);
  ok('Trace de l’ouverture dans le journal', actions.includes('SIGNALEMENT_OUVERTURE'));
  ok('Trace de la prise en charge', actions.includes('SIGNALEMENT_PRISE_EN_CHARGE'));
  ok('Trace de la résolution', actions.includes('SIGNALEMENT_RESOLU'));

  const notifications = await api(chefVisa.token, 'GET', '/notifications');
  const messages = (notifications.data?.notifications || []).map((n) => n.message || '');
  ok('Le chef de division a été prévenu de la prise en charge',
    messages.some((m) => /pris en charge/i.test(m)));
  ok('Le chef de division a été prévenu de la résolution',
    messages.some((m) => /résolu/i.test(m)));

  const statutDossier = await api(verifVisa.token, 'GET', `/dossiers/${visa.id}`);
  ok('Le statut du dossier n’a pas été changé par le signalement',
    statutDossier.data?.statut_code === statutInitial,
    `${statutInitial} → ${statutDossier.data?.statut_code}`);

  section('7. Le rejet est une décision, pas un oubli');
  const solde = await creerDossier(secretaire, 'SOLDE');
  const ouvertureSolde = await api(chefSolde.token, 'POST', `/dossiers/${solde.id}/signalements`, {
    type: 'ARBITRAGE',
    priorite: 'NORMALE',
    motif: 'Désaccord sur la pièce exigée pour ce mandatement.',
  });
  ok('Signalement Solde créé', ouvertureSolde.status === 201,
    `${ouvertureSolde.status} ${ouvertureSolde.data?.message || ''}`);

  const rejet = await api(chefService.token, 'PUT', `/signalements/${ouvertureSolde.data?.id}/resoudre`, {
    statut: 'REJETE',
    resolution: 'La pièce exigée est bien obligatoire : le référentiel ne prévoit aucune dispense.',
  });
  ok('Rejet : 200', rejet.status === 200, `${rejet.status}`);
  ok('Statut REJETE', rejet.data?.statut === 'REJETE', rejet.data?.statut);
  ok('Le rejet porte son motif', Boolean(rejet.data?.resolution));

  section('8. Compteur');
  const compte = await api(chefService.token, 'GET', '/signalements/compte');
  ok('Le compteur répond', compte.status === 200, String(compte.data?.ouverts));

  const compteAgent = await api(verifVisa.token, 'GET', '/signalements/compte');
  ok('Le compteur est lisible par un agent', compteAgent.status === 200,
    String(compteAgent.data?.ouverts));

  const fileAgent = await api(verifVisa.token, 'GET', '/signalements');
  ok('La file complète reste fermée à un agent', fileAgent.status === 403, `${fileAgent.status}`);

  console.log(`\nRésultat : ${reussis} réussite(s), ${echecs} échec(s).`);
  process.exit(echecs ? 1 : 0);
}

main().catch((err) => {
  console.error('Erreur du test :', err.message);
  process.exit(1);
});

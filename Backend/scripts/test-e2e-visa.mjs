/**
 * Test de bout en bout du circuit VISA.
 *
 * Le scénario est celui du cahier des charges : un dossier VISA est reçu,
 * instruit, contrôlé, soumis au Chef de Division, validé, signé par le Chef
 * de Service, puis archivé par le vérificateur VISA.
 *
 * Le test vérifie aussi ce qui DOIT échouer :
 *   - la validation d'un dossier incomplet est bloquée ;
 *   - un rôle technique ne peut pas signer à la place du Chef de Service ;
 *   - l'archivage est refusé tant que la signature ou les pièces d'archivage
 *     manquent ;
 *   - la suppression exige un motif et le rôle Administrateur.
 *
 * Usage : node scripts/test-e2e-visa.mjs
 */

const BASE = process.env.API_URL || 'http://localhost:5000/api';

let reussis = 0;
let echecs = 0;
const journal = [];

function ok(nom, condition, detail = '') {
  if (condition) {
    reussis += 1;
    journal.push(`  OK   ${nom}${detail ? ` — ${detail}` : ''}`);
    console.log(`  OK   ${nom}${detail ? ` — ${detail}` : ''}`);
  } else {
    echecs += 1;
    journal.push(`  ECHEC ${nom}${detail ? ` — ${detail}` : ''}`);
    console.error(`  ECHEC ${nom}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(titre) {
  console.log(`\n=== ${titre} ===`);
}

/**
 * Nettoyage des pièces de test.
 *
 * L'API ne supprime jamais une pièce : elle la désactive, et c'est la règle du
 * référentiel (une pièce citée par un dépouillement doit rester lisible). Une
 * campagne laisserait donc une ligne `PIECE_TEST_*` par exécution. Le test
 * retire les siennes en fin de course — et celles des exécutions précédentes,
 * pour réparer les bases déjà polluées.
 */
async function nettoyerPiecesTest() {
  try {
    const { default: db } = await import('../src/config/db.js');
    const r = await db.query("DELETE FROM types_pieces WHERE code LIKE 'PIECE_TEST_%'");
    if (r.affectedRows) {
      console.log(`  (nettoyage : ${r.affectedRows} pièce(s) de test supprimée(s))`);
    }
    await db.pool.end();
  } catch (e) {
    console.warn(`  (nettoyage des pièces de test impossible : ${e.message})`);
  }
}

/** Connexion : renvoie le jeton et le profil. */
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

/** Appel authentifié. */
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

/**
 * Matricule de test : 2 à 10 caractères alphanumériques, comme l'impose la
 * règle de service. La base36 de l'horodatage garantit l'unicité d'une
 * exécution à l'autre sans dépasser la borne.
 */
let compteurMatricule = 0;
function matriculeTest(prefix = 'T') {
  compteurMatricule += 1;
  return `${prefix}${(Date.now() % 1e7).toString(36).toUpperCase()}${compteurMatricule}`.slice(0, 10);
}

async function main() {
  console.log(`Test du circuit VISA — ${BASE}`);

  /* ------------------------------------------------------------------ */
  section('1. Connexions');

  const secretaire = await login('secretaire');
  ok('Connexion secrétaire', Boolean(secretaire.token), secretaire.user?.role_nom);

  const verif = await login('verif.visa');
  ok('Connexion vérificateur VISA', Boolean(verif.token), verif.user?.role_nom);

  const chefVisa = await login('chef.visa');
  ok('Connexion Chef de Division VISA', Boolean(chefVisa.token), chefVisa.user?.role_nom);

  const chefService = await login('chef.service');
  ok('Connexion Chef de Service', Boolean(chefService.token), chefService.user?.role_nom);

  const admin = await login('admin', 'Admin123!');
  ok('Connexion administrateur', Boolean(admin.token), admin.user?.role_nom);

  /* ------------------------------------------------------------------ */
  section('2. Référentiel');

  const referentiel = await api(secretaire.token, 'GET', '/referentiel');
  const typeVisa = (referentiel.data.types_dossiers || []).find((t) => t.code === 'VISA');
  ok('Type de dossier VISA présent', Boolean(typeVisa), typeVisa?.libelle);

  const sousType = (referentiel.data.sous_types || []).find(
    (s) => s.type_dossier_id === typeVisa?.id
  );
  ok('Sous-type VISA présent', Boolean(sousType), sousType?.libelle);

  const priorite = referentiel.data.priorites?.[0];
  ok('Priorité de référence', Boolean(priorite), priorite?.libelle);

  const divisions = await api(secretaire.token, 'GET', '/divisions');
  const divisionVisa = (divisions.data || []).find(
    (d) => d.type_code === 'VISA' || d.code === 'VISA' || /visa/i.test(d.nom || '')
  );
  ok('Division VISA identifiée', Boolean(divisionVisa), divisionVisa?.nom);

  const agents = await api(verif.token, 'GET', '/agents');
  const agentVerif = (agents.data || []).find(
    (a) => a.division_id === divisionVisa?.id && a.actif !== 0 && a.peut_traiter
  );
  ok('Agent vérificateur VISA identifié', Boolean(agentVerif),
    agentVerif ? `${agentVerif.nom} ${agentVerif.prenom || ''}` : '');

  /* ------------------------------------------------------------------ */
  section('3. Création du dossier VISA');

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const corpsVisa = {
    type_id: typeVisa.id,
    objet: 'Visa de mariage — test de bout en bout',
    demandeur: 'RAKOTO Jean',
    demandeur_nom: 'RAKOTO',
    demandeur_prenom: 'Jean',
    matricule: matriculeTest('TV'),
    date_reception: aujourdhui,
    date_heure_reception: `${aujourdhui}T09:30:00`,
    division_id: divisionVisa?.id,
    priorite_id: priorite.id,
    sous_type_id: sousType?.id,
    reference_visa: `VISA-TEST-${Date.now()}`,
    origine_presentateur: 'Guichet central',
    comptable_presentateur: 'Comptable RAKOTO',
    type_acte: sousType?.libelle,
    annee_reference: new Date().getFullYear(),
    beneficiaire: 'RAKOTO Jean',
    organisme: 'Mairie de Fitovinany',
    verificateur_id: agentVerif?.id,
    observation: 'Dossier créé par le test de bout en bout.',
  };

  const creation = await api(secretaire.token, 'POST', '/dossiers', corpsVisa);
  ok('Création du dossier VISA', creation.status === 201,
    creation.status === 201 ? `n° ${creation.data.numero}` : `${creation.status} ${creation.data.message}`);
  if (creation.status !== 201) {
    console.error(JSON.stringify(creation.data, null, 2));
    throw new Error('Impossible de poursuivre sans dossier.');
  }
  const dossierId = creation.data.id;

  const apresCreation = await api(secretaire.token, 'GET', `/dossiers/${dossierId}`);
  /* Le routage est automatique : la création oriente le dossier vers la
     division de son type et l'affecte à un agent de traitement. Le dossier
     n'attend donc pas une orientation manuelle. */
  ok('Statut après création : AFFECTE (orientation et affectation automatiques)',
    apresCreation.data.statut_code === 'AFFECTE', apresCreation.data.statut_code);
  ok('Référence VISA enregistrée', Boolean(apresCreation.data.reference_visa),
    apresCreation.data.reference_visa);
  ok('Type d\'acte déduit du sous-type', Boolean(apresCreation.data.type_acte),
    apresCreation.data.type_acte);
  ok('Vérificateur enregistré', Boolean(apresCreation.data.verificateur_id),
    apresCreation.data.verificateur_nom);

  /* ------------------------------------------------------------------ */
  section('4. Traitement');

  const traitement = await api(verif.token, 'POST', `/dossiers/${dossierId}/traiter`, {
    observation: 'Prise en charge par le vérificateur.',
  });
  ok('Prise en charge par le vérificateur', traitement.status === 200,
    `${traitement.status} ${traitement.data.message || ''}`);

  /* ------------------------------------------------------------------ */
  section('5. Contrôle des pièces (quatre états)');

  const dep = await api(verif.token, 'GET', `/dossiers/${dossierId}/depouillement`);
  ok('Liste de contrôle des pièces', dep.status === 200,
    `${dep.data.depouillement?.length || 0} pièce(s) au dépouillement`);

  const piecesDep = dep.data.depouillement || [];
  ok('Des pièces de dépouillelement sont configurées pour le VISA',
    piecesDep.length > 0, `${piecesDep.length}`);

  /* Une pièce non « présente » doit être motivée : le serveur refuse un état
     autre que PRESENTE sans motif. */
  if (piecesDep.length > 0) {
    const sansMotif = await api(verif.token, 'POST', `/dossiers/${dossierId}/depouillement`, {
      piece: piecesDep[0].code,
      presente: false,
      etat: 'MANQUANTE',
    });
    ok('État non présent sans motif refusé', sansMotif.status >= 400,
      `${sansMotif.status} ${sansMotif.data.message || ''}`);

    const avecMotif = await api(verif.token, 'POST', `/dossiers/${dossierId}/depouillement`, {
      piece: piecesDep[0].code,
      presente: false,
      etat: 'MANQUANTE',
      motif: 'Copie illisible remise par le demandeur.',
    });
    ok('État non présent avec motif accepté', avecMotif.status === 200,
      `${avecMotif.status} ${avecMotif.data.message || ''}`);

    const etatRelu = await api(verif.token, 'GET', `/dossiers/${dossierId}/depouillement`);
    const relue = (etatRelu.data.depouillement || []).find((p) => p.code === piecesDep[0].code);
    ok('Motif conservé au dépouillement', Boolean(relue?.motif), relue?.motif);
    ok('État « manquante » conservé', relue?.etat === 'MANQUANTE', relue?.etat);
  }

  for (const piece of piecesDep) {
    await api(verif.token, 'POST', `/dossiers/${dossierId}/depouillement`, {
      piece: piece.code,
      presente: true,
      etat: 'PRESENTE',
    });
  }
  const depApres = await api(verif.token, 'GET', `/dossiers/${dossierId}/depouillement`);
  ok('Toutes les pièces de dépouillement sont présentes',
    depApres.data.resume?.par_phase?.DEPOUILLEMENT?.complet === true,
    `${depApres.data.resume?.par_phase?.DEPOUILLEMENT?.presentes}/${depApres.data.resume?.par_phase?.DEPOUILLEMENT?.total}`);

  /* ------------------------------------------------------------------ */
  section('6. Soumission et validation');

  const soumission = await api(verif.token, 'POST', `/dossiers/${dossierId}/verifier`, {
    resultat: 'OK',
    observation: 'Pièces contrôlées, dossier soumis à vérification.',
  });
  ok('Soumission à vérification', soumission.status === 200,
    `${soumission.status} ${soumission.data.message || ''}`);

  const validation = await api(chefVisa.token, 'POST', `/dossiers/${dossierId}/valider`, {
    decision: 'VALIDE',
    commentaire: 'Dossier complet et conforme.',
  });
  ok('Validation par le Chef de Division VISA', validation.status === 200,
    `${validation.status} ${validation.data.message || ''}`);

  const apresValidation = await api(secretaire.token, 'GET', `/dossiers/${dossierId}`);
  ok('Statut après validation : VALIDE', apresValidation.data.statut_code === 'VALIDE',
    apresValidation.data.statut_code);

  /* ------------------------------------------------------------------ */
  section('7. Signature — réservée au Chef de Service');

  const signatureParTechnique = await api(chefVisa.token, 'POST', `/dossiers/${dossierId}/signer`, {
    reference: 'REF-INTERDITE',
  });
  ok('Signature refusée à un rôle technique (403)', signatureParTechnique.status === 403,
    `${signatureParTechnique.status} ${signatureParTechnique.data.message || ''}`);

  const signatureParVerif = await api(verif.token, 'POST', `/dossiers/${dossierId}/signer`, {
    reference: 'REF-INTERDITE',
  });
  ok('Signature refusée au vérificateur VISA (403)', signatureParVerif.status === 403,
    `${signatureParVerif.status} ${signatureParVerif.data.message || ''}`);

  const signature = await api(chefService.token, 'POST', `/dossiers/${dossierId}/signer`, {
    reference: '045/SRSP/2026',
    observation: 'Signé par le Chef de Service.',
  });
  ok('Signature par le Chef de Service', signature.status === 200,
    `${signature.status} ${signature.data.message || ''}`);

  const apresSignature = await api(secretaire.token, 'GET', `/dossiers/${dossierId}`);
  ok('Statut après signature : SIGNE', apresSignature.data.statut_code === 'SIGNE',
    apresSignature.data.statut_code);
  ok('Signataire enregistré', Boolean(apresSignature.data.signataire_username),
    apresSignature.data.signataire_username);
  ok('Date de signature enregistrée', Boolean(apresSignature.data.date_signature),
    apresSignature.data.date_signature);
  ok('Référence de signature enregistrée', Boolean(apresSignature.data.reference_signature),
    apresSignature.data.reference_signature);

  /* ------------------------------------------------------------------ */
  section('8. Archivage — bloqué sans les pièces d\'archivage');

  const archivageTropTot = await api(verif.token, 'POST', `/dossiers/${dossierId}/archiver`, {});
  ok('Archivage refusé sans les pièces d\'archivage', archivageTropTot.status >= 400,
    `${archivageTropTot.status} ${archivageTropTot.data.message || ''}`);

  const piecesArchivage = dep.data.archivage || [];
  ok('Des pièces d\'archivage sont configurées pour le VISA',
    piecesArchivage.length > 0, `${piecesArchivage.length}`);
  for (const piece of piecesArchivage) {
    await api(verif.token, 'POST', `/dossiers/${dossierId}/depouillement`, {
      piece: piece.code,
      presente: true,
      etat: 'PRESENTE',
    });
  }

  const archivage = await api(verif.token, 'POST', `/dossiers/${dossierId}/archiver`, {});
  ok('Archivage par le vérificateur VISA', archivage.status === 200,
    `${archivage.status} ${archivage.data.message || ''}`);

  const apresArchivage = await api(secretaire.token, 'GET', `/dossiers/${dossierId}`);
  ok('Statut après archivage : ARCHIVE', apresArchivage.data.statut_code === 'ARCHIVE',
    apresArchivage.data.statut_code);
  ok('Date d\'archivage enregistrée', Boolean(apresArchivage.data.date_archivage),
    apresArchivage.data.date_archivage);

  /* ------------------------------------------------------------------ */
  section('9. Validation bloquée sur dossier incomplet');

  /* Un dossier VISA doit être complet dès la réception : le service refuse
     la création si l'origine ou le comptable manque. Pour éprouver le
     contrôle de validation, on part donc d'un dossier complet, puis on
     efface une donnée obligatoire et on laisse les pièces non satisfaites. */
  const incomplet = await api(secretaire.token, 'POST', '/dossiers', {
    ...corpsVisa,
    reference_visa: `VISA-INCOMPLET-${Date.now()}`,
    matricule: matriculeTest('TI'),
  });
  ok('Création d\'un dossier VISA', incomplet.status === 201,
    `${incomplet.status} ${incomplet.data.message || ''}`);

  if (incomplet.status === 201) {
    const idIncomplet = incomplet.data.id;

    const creationIncomplete = await api(secretaire.token, 'POST', '/dossiers', {
      ...corpsVisa,
      reference_visa: `VISA-INCOMPLET2-${Date.now()}`,
      origine_presentateur: '',
      comptable_presentateur: '',
      matricule: matriculeTest('TI'),
    });
    ok('Création VISA sans origine ni comptable refusée (422)',
      creationIncomplete.status === 422,
      `${creationIncomplete.status} ${creationIncomplete.data.message || ''}`);

    /* Champs obligatoires effacés après coup : la validation doit s'en
       apercevoir. */
    const effacement = await api(secretaire.token, 'PUT', `/dossiers/${idIncomplet}`, {
      ...corpsVisa,
      reference_visa: `VISA-INCOMPLET-${Date.now()}`,
      origine_presentateur: '',
    });
    ok('Effacement d\'un champ VISA obligatoire accepté par la mise à jour',
      effacement.status === 200, `${effacement.status} ${effacement.data.message || ''}`);

    await api(verif.token, 'POST', `/dossiers/${idIncomplet}/traiter`, { observation: 'Contrôle.' });
    await api(verif.token, 'POST', `/dossiers/${idIncomplet}/verifier`, {
      resultat: 'OK', observation: 'Soumis.',
    });

    const validationBloquee = await api(chefVisa.token, 'POST', `/dossiers/${idIncomplet}/valider`, {
      decision: 'VALIDE',
      commentaire: 'Tentative sur dossier incomplet.',
    });
    ok('Validation d\'un dossier incomplet bloquée (422)', validationBloquee.status === 422,
      `${validationBloquee.status} ${validationBloquee.data.message || ''}`);

    const derogationParTechnique = await api(chefVisa.token, 'POST', `/dossiers/${idIncomplet}/valider`, {
      decision: 'VALIDE',
      commentaire: 'Tentative avec motif, par un rôle non autorisé.',
      motif_exception: 'Pièce à réclamer au guichet, délai urgent.',
    });
    ok('Dérogation refusée à un rôle non autorisé (403)',
      derogationParTechnique.status === 403,
      `${derogationParTechnique.status} ${derogationParTechnique.data.message || ''}`);

    const derogation = await api(chefService.token, 'POST', `/dossiers/${idIncomplet}/valider`, {
      decision: 'VALIDE',
      commentaire: 'Validation exceptionnelle, chef de service.',
      motif_exception: 'Pièce à réclamer au guichet, délai urgent.',
    });
    ok('Dérogation tracée par le Chef de Service', derogation.status === 200,
      `${derogation.status} ${derogation.data.message || ''}`);

    const avecException = await api(secretaire.token, 'GET', `/dossiers/${idIncomplet}`);
    ok('Dérogation enregistrée sur le dossier', Boolean(avecException.data.exception_validation),
      avecException.data.exception_validation);
  }

  /* ------------------------------------------------------------------ */
  section('10. Suppression — rôle administrateur et motif obligatoire');

  const jetonSecretaire = secretaire.token;
  const suppressionParSecretaire = await api(jetonSecretaire, 'DELETE', `/dossiers/${dossierId}`, {
    motif: 'Tentative de suppression par le secrétariat.',
  });
  ok('Suppression refusée hors du rôle administrateur (403/404)',
    suppressionParSecretaire.status === 403 || suppressionParSecretaire.status === 404,
    `${suppressionParSecretaire.status} ${suppressionParSecretaire.data.message || ''}`);

  const jetonChefService = chefService.token;
  const suppressionParChef = await api(jetonChefService, 'DELETE', `/dossiers/${dossierId}`, {
    motif: 'Tentative de suppression par le chef de service.',
  });
  ok('Suppression refusée au chef de service (403)', suppressionParChef.status === 403,
    `${suppressionParChef.status} ${suppressionParChef.data.message || ''}`);

  /* Un dossier encore en ORIENTE peut être supprimé : on en crée un pour
     l'épreuve. */
  const jetonAdmin = admin.token;
  const aSupprimer = await api(secretaire.token, 'POST', '/dossiers', {
    ...corpsVisa,
    reference_visa: `VISA-SUPPR-${Date.now()}`,
    matricule: matriculeTest('TS'),
  });
  if (aSupprimer.status === 201) {
    const sansMotif = await api(jetonAdmin, 'DELETE', `/dossiers/${aSupprimer.data.id}`, {});
    ok('Suppression sans motif refusée (422)', sansMotif.status === 422,
      `${sansMotif.status} ${sansMotif.data.message || ''}`);

    const avecMotif = await api(jetonAdmin, 'DELETE', `/dossiers/${aSupprimer.data.id}`, {
      motif: 'Dossier créé par erreur lors du test.',
    });
    ok('Suppression par l\'administrateur avec motif', avecMotif.status === 200,
      `${avecMotif.status} ${avecMotif.data.message || ''}`);

    const relu = await api(jetonAdmin, 'GET', `/dossiers/${aSupprimer.data.id}`);
    ok('Dossier supprimé introuvable ensuite (404)', relu.status === 404,
      `${relu.status}`);

    /* La suppression ne doit pas être muette : la trace survit au dossier. */
    const traces = await api(jetonAdmin, 'GET', '/dossiers/suppressions');
    ok('Trace des suppressions disponible', traces.status === 200,
      `${traces.status}`);
    const trace = (traces.data || []).find(
      (t) => t.dossier_id === aSupprimer.data.id
    );
    ok('Suppression tracée avec son motif', Boolean(trace?.motif), trace?.motif);
    ok('Instantané du journal conservé', (trace?.nb_actions_historique ?? 0) > 0,
      `${trace?.nb_actions_historique} action(s)`);
  }

  /* Un dossier qui porte un historique de traitement ne se supprime pas. */
  const aPreserver = await api(secretaire.token, 'POST', '/dossiers', {
    ...corpsVisa,
    reference_visa: `VISA-PRESERVE-${Date.now()}`,
    matricule: matriculeTest('TP'),
  });
  if (aPreserver.status === 201) {
    await api(verif.token, 'POST', `/dossiers/${aPreserver.data.id}/traiter`, {
      observation: 'Prise en charge : le dossier entre dans l\'historique de traitement.',
    });
    const refus = await api(jetonAdmin, 'DELETE', `/dossiers/${aPreserver.data.id}`, {
      motif: 'Tentative de suppression d\'un dossier déjà traité.',
    });
    ok('Suppression refusée après traitement (409)', refus.status === 409,
      `${refus.status} ${refus.data.message || ''}`);
  }

  /* ------------------------------------------------------------------ */
  section('11. Demande de complément');

  const complement = await api(secretaire.token, 'POST', '/dossiers', {
    ...corpsVisa,
    reference_visa: `VISA-COMP-${Date.now()}`,
    matricule: matriculeTest('TC'),
  });
  if (complement.status === 201) {
    const idComplement = complement.data.id;
    await api(verif.token, 'POST', `/dossiers/${idComplement}/traiter`, { observation: 'Contrôle.' });

    const sansMotifComplement = await api(verif.token, 'POST', `/dossiers/${idComplement}/demander-complement`, {
      motif: '',
    });
    ok('Demande de complément sans motif refusée (422)',
      sansMotifComplement.status === 422,
      `${sansMotifComplement.status} ${sansMotifComplement.data.message || ''}`);

    const avecMotifComplement = await api(verif.token, 'POST', `/dossiers/${idComplement}/demander-complement`, {
      motif: 'Certificat de résidence manquant.',
    });
    ok('Demande de complément avec motif', avecMotifComplement.status === 200,
      `${avecMotifComplement.status} ${avecMotifComplement.data.message || ''}`);

    const reluComplement = await api(secretaire.token, 'GET', `/dossiers/${idComplement}`);
    ok('Statut « en attente de complément »', reluComplement.data.statut_code === 'EN_ATTENTE_COMPLEMENT',
      reluComplement.data.statut_code);
    ok('Motif du complément enregistré', Boolean(reluComplement.data.motif_complement),
      reluComplement.data.motif_complement);
  }

  /* ------------------------------------------------------------------ */
  section('12. Boîte de travail et rapports');

  const boite = await api(chefVisa.token, 'GET', '/dashboard/boite-travail');
  ok('Boîte de travail disponible', boite.status === 200,
    `${boite.data.a_traiter_par_moi?.total ?? 0} dossier(s) à traiter`);

  const rapportPdf = await fetch(`${BASE}/rapports/visa/pdf`, {
    headers: { Authorization: `Bearer ${chefService.token}` },
  });
  const typeRapport = rapportPdf.headers.get('content-type') || '';
  ok('Rapport VISA (PDF) disponible', rapportPdf.status === 200 && typeRapport.includes('pdf'),
    `${rapportPdf.status} ${typeRapport}`);

  const rapportVerificateur = await fetch(`${BASE}/rapports/visa-par-verificateur/excel`, {
    headers: { Authorization: `Bearer ${chefService.token}` },
  });
  ok('Rapport VISA par vérificateur (Excel) disponible', rapportVerificateur.status === 200,
    `${rapportVerificateur.status}`);

  /* ------------------------------------------------------------------ */
  section('13. Référentiel — sous-types et pièces requises');

  const sousTypes = await api(admin.token, 'GET', '/referentiel/sous-types');
  ok('Sous-types listés', sousTypes.status === 200,
    `${(sousTypes.data || []).length} sous-type(s)`);
  const sousTypeVisa = (sousTypes.data || []).find((s) => s.type_code === 'VISA');
  ok('Sous-type VISA présent', Boolean(sousTypeVisa), sousTypeVisa?.libelle);
  ok('Sous-type VISA actif', sousTypeVisa?.actif === 1, `actif=${sousTypeVisa?.actif}`);

  const creationSousType = await api(admin.token, 'POST', '/referentiel/sous-types', {
    type_dossier_id: typeVisa.id,
    code: `VISA_TEST_${Date.now() % 100000}`,
    libelle: 'Visa de test (E2E)',
    ordre: 95,
  });
  ok('Création d\'un sous-type', creationSousType.status === 201,
    `${creationSousType.status} ${creationSousType.data.message || ''}`);

  if (creationSousType.status === 201) {
    const idSousType = creationSousType.data.id;

    const desactivation = await api(admin.token, 'PUT', `/referentiel/sous-types/${idSousType}`, {
      actif: 0,
    });
    ok('Désactivation d\'un sous-type', desactivation.status === 200,
      `${desactivation.status}`);

    const creationPiece = await api(admin.token, 'POST', '/referentiel/types-pieces', {
      code: `PIECE_TEST_${Date.now() % 100000}`,
      libelle: 'Pièce de test (E2E)',
      phase: 'DEPOUILLEMENT',
      obligatoire: 1,
      type_dossier_id: typeVisa.id,
      sous_type_id: idSousType,
    });
    ok('Création d\'une pièce rattachée à un sous-type', creationPiece.status === 201,
      `${creationPiece.status} ${creationPiece.data.message || ''}`);

    if (creationPiece.status === 201) {
      const idPiece = creationPiece.data.id;
      const desactivationPiece = await api(admin.token, 'DELETE', `/referentiel/types-pieces/${idPiece}`);
      ok('Désactivation d\'une pièce (et non suppression)', desactivationPiece.status === 200,
        `${desactivationPiece.status} ${desactivationPiece.data.message || ''}`);

      const relecture = await api(admin.token, 'GET', `/referentiel/types-pieces?actif=0`);
      const desactivee = (relecture.data || []).find((p) => p.id === idPiece);
      ok('Pièce conservée mais désactivée', desactivee?.actif === 0,
        `actif=${desactivee?.actif}`);

      /* Une pièce active interdit la suppression du sous-type. */
      const reactivation = await api(admin.token, 'PUT', `/referentiel/types-pieces/${idPiece}`, {
        actif: 1,
      });
      ok('Réactivation de la pièce', reactivation.status === 200, `${reactivation.status}`);

      const suppressionActive = await api(admin.token, 'DELETE', `/referentiel/sous-types/${idSousType}`);
      ok('Suppression refusée si une pièce active s\'y rattache',
        suppressionActive.status === 409,
        `${suppressionActive.status} ${suppressionActive.data.message || ''}`);

      /* Une pièce désactivée est détachée : plus aucune ligne ne référence un
         sous-type supprimé. */
      await api(admin.token, 'DELETE', `/referentiel/types-pieces/${idPiece}`);
      const suppression = await api(admin.token, 'DELETE', `/referentiel/sous-types/${idSousType}`);
      ok('Suppression du sous-type une fois la pièce désactivée',
        suppression.status === 200,
        `${suppression.status} ${suppression.data.message || ''}`);

      const piecesRestantes = await api(admin.token, 'GET', '/referentiel/types-pieces');
      const encoreRattachee = (piecesRestantes.data || []).find((p) => p.id === idPiece);
      ok('Pièce détachée du sous-type supprimé',
        encoreRattachee?.sous_type_id === null || encoreRattachee?.sous_type_id === undefined,
        `sous_type_id=${encoreRattachee?.sous_type_id}`);
    }
  }

  const permissionsAdmin = await api(admin.token, 'GET', '/permissions/me');
  const permsAdmin = (permissionsAdmin.data || []).map((p) => (typeof p === 'string' ? p : p.nom));
  ok('Administrateur sans pouvoir de signer',
    !permsAdmin.includes('signer_dossier'), 'signer_dossier absent');
  ok('Administrateur sans pouvoir de valider',
    !permsAdmin.includes('valider_dossier'), 'valider_dossier absent');
  ok('Administrateur sans pouvoir d\'archiver',
    !permsAdmin.includes('archiver_dossier'), 'archiver_dossier absent');
  ok('Administrateur avec pouvoir de supprimer un dossier',
    permsAdmin.includes('delete_dossier'), 'delete_dossier présent');
  ok('Administrateur avec pouvoir de configurer les pièces',
    permsAdmin.includes('configurer_pieces'), 'configurer_pieces présent');

  /* ------------------------------------------------------------------ */
  await nettoyerPiecesTest();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Résultat : ${reussis} test(s) réussi(s), ${echecs} échec(s).`);
  console.log(`${'='.repeat(60)}\n`);
  process.exit(echecs === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error('\nÉCHEC FATAL :', e.message);
  console.error(e.stack);
  await nettoyerPiecesTest();
  process.exit(1);
});

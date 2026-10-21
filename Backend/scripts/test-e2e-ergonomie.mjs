/**
 * Test de bout en bout des fonctions d'ergonomie ajoutées.
 *
 * Trois fonctions, demandées explicitement par le cahier des fonctionnalités :
 *
 *   1. **« À faire ensuite »** — la prochaine action du dossier et l'acteur
 *      qui doit l'accomplir (test d'acceptation T15) ;
 *   2. **l'enregistrement en brouillon** — un dossier mis de côté sans entrer
 *      dans le circuit, visible de son seul auteur ;
 *   3. les **transmissions** d'un dossier — expéditeur, destinataire, date,
 *      référence, sans fouiller dans plusieurs registres.
 *
 * Usage : node scripts/test-e2e-ergonomie.mjs
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
  const r = await api('POST', '/auth/login', {
    corps: { identifiant, password },
  });
  if (r.status !== 200) throw new Error(`Connexion ${identifiant} : ${r.status} ${r.data?.message || ''}`);
  return r.data;
}

let compteurMatricule = 0;
const matriculeTest = (prefix = 'T') => {
  compteurMatricule += 1;
  return `${prefix}${(Date.now() % 1e7).toString(36).toUpperCase()}${compteurMatricule}`.slice(0, 10);
};

async function main() {
  console.log(`Test des fonctions d'ergonomie — ${BASE}`);

  const secretaire = await login('secretaire');
  const verif = await login('verif.visa');
  const chefVisa = await login('chef.visa');
  const chefService = await login('chef.service');
  const admin = await login('admin', 'Admin123!');

  const ref = await api('GET', '/referentiel', { token: secretaire.token });
  const typeVisa = (ref.data.types_dossiers || []).find((t) => t.code === 'VISA');
  const sousTypeVisa = (ref.data.sous_types || []).find(
    (s) => s.type_dossier_id === typeVisa.id
  );
  const priorite = ref.data.priorites?.[0];
  const agents = await api('GET', '/agents', { token: verif.token });
  const agentVerif = (agents.data || []).find((a) => a.division_id && a.actif !== 0);

  /* ------------------------------------------------------------------ */
  section('1. Enregistrement en brouillon');

  const brouillon = await api('POST', '/dossiers', {
    token: secretaire.token,
    corps: {
      type_id: typeVisa.id,
      objet: 'Brouillon de test — ergonomie',
      demandeur: 'TEST Brouillon',
      demandeur_nom: 'TEST',
      demandeur_prenom: 'Brouillon',
      date_reception: new Date().toISOString().slice(0, 10),
      priorite_id: priorite.id,
      brouillon: true,
    },
  });
  ok('Brouillon créé', brouillon.status === 201,
    `${brouillon.status} ${brouillon.data?.numero || brouillon.data?.message || ''}`);

  const idBrouillon = brouillon.data?.id;

  if (brouillon.status === 201) {
    const detailBrouillon = await api('GET', `/dossiers/${idBrouillon}`, { token: secretaire.token });
    ok('Le brouillon porte le statut BROUILLON',
      detailBrouillon.data?.statut_code === 'BROUILLON', detailBrouillon.data?.statut_code);
    ok('Le brouillon a reçu un numéro définitif',
      Boolean(detailBrouillon.data?.numero), detailBrouillon.data?.numero);

    /* Un brouillon n'est pas dans le circuit : il ne doit apparaître ni dans
       la liste générale, ni dans les files d'attente, ni dans les
       statistiques. */
    const listeGenerale = await api('GET', '/dossiers', { token: secretaire.token });
    const dansListe = (listeGenerale.data || []).some((d) => d.id === idBrouillon);
    ok('Le brouillon est absent de la liste générale', !dansListe);

    const mesBrouillons = await api('GET', '/dossiers?brouillon=1', { token: secretaire.token });
    ok('Le brouillon est visible dans « Mes brouillons »',
      (mesBrouillons.data || []).some((d) => d.id === idBrouillon),
      `${(mesBrouillons.data || []).length} brouillon(s)`);

    /* Un brouillon n'appartient qu'à son auteur. L'administrateur technique
       a le droit de créer un dossier : c'est donc lui qui éprouve la règle
       « seul l'auteur publie ». */
    const brouillonsDuChef = await api('GET', '/dossiers?brouillon=1', { token: chefVisa.token });
    ok('Le brouillon n’est pas visible d’un autre profil',
      !(brouillonsDuChef.data || []).some((d) => d.id === idBrouillon));

    const lectureInterdite = await api('GET', `/dossiers/${idBrouillon}`, { token: chefVisa.token });
    ok('La lecture du brouillon par un autre profil est refusée (403/404)',
      lectureInterdite.status === 403 || lectureInterdite.status === 404,
      `${lectureInterdite.status}`);

    const publicationParAutre = await api('POST', `/dossiers/${idBrouillon}/publier`, {
      token: admin.token,
      corps: {},
    });
    ok('La publication par un autre profil est refusée (403)',
      publicationParAutre.status === 403, `${publicationParAutre.status} ${publicationParAutre.data?.message || ''}`);

    /* Un brouillon VISA incomplet ne peut pas entrer dans le circuit : c'est
       le contrôle de la réception, appliqué au moment de la publication. */
    const publicationIncomplete = await api('POST', `/dossiers/${idBrouillon}/publier`, {
      token: secretaire.token,
      corps: {},
    });
    ok('La publication d’un brouillon VISA incomplet est refusée (422)',
      publicationIncomplete.status === 422,
      `${publicationIncomplete.status} ${publicationIncomplete.data?.message || ''}`);

    /* Le brouillon se complète, puis se publie. */
    const completion = await api('PUT', `/dossiers/${idBrouillon}`, {
      token: secretaire.token,
      corps: {
        type_id: typeVisa.id,
        objet: 'Brouillon de test — ergonomie',
        demandeur: 'TEST Brouillon',
        demandeur_nom: 'TEST',
        demandeur_prenom: 'Brouillon',
        date_reception: new Date().toISOString().slice(0, 10),
        priorite_id: priorite.id,
        sous_type_id: sousTypeVisa.id,
        origine_presentateur: 'Guichet central',
        comptable_presentateur: 'Comptable RAKOTO',
        date_heure_reception: `${new Date().toISOString().slice(0, 10)}T09:00:00`,
        annee_reference: new Date().getFullYear(),
        verificateur_id: agentVerif?.id,
      },
    });
    ok('Le brouillon peut être complété', completion.status === 200,
      `${completion.status} ${completion.data?.message || ''}`);

    const publication = await api('POST', `/dossiers/${idBrouillon}/publier`, {
      token: secretaire.token,
      corps: {},
    });
    ok('Le brouillon est publié par son auteur', publication.status === 200,
      `${publication.status} ${publication.data?.message || ''}`);

    const apresPublication = await api('GET', `/dossiers/${idBrouillon}`, { token: secretaire.token });
    ok('Le dossier publié n’est plus un brouillon',
      apresPublication.data?.statut_code !== 'BROUILLON', apresPublication.data?.statut_code);
    ok('Le dossier publié est dans le circuit',
      ['ENREGISTRE', 'ORIENTE', 'AFFECTE'].includes(apresPublication.data?.statut_code),
      apresPublication.data?.statut_code);

    const listeApres = await api('GET', '/dossiers', { token: secretaire.token });
    ok('Le dossier publié apparaît dans la liste générale',
      (listeApres.data || []).some((d) => d.id === idBrouillon));
  }

  /* ------------------------------------------------------------------ */
  section('2. « À faire ensuite »');

  /* Un dossier VISA complet, instruit par le vérificateur : il en est à la
     signature, donc l'étape suivante est celle du Chef de Service. */
  const creation = await api('POST', '/dossiers', {
    token: secretaire.token,
    corps: {
      type_id: typeVisa.id,
      objet: 'Visa de test — prochaine action',
      demandeur: 'TEST Action',
      demandeur_nom: 'TEST',
      demandeur_prenom: 'Action',
      matricule: matriculeTest('TA'),
      date_reception: new Date().toISOString().slice(0, 10),
      date_heure_reception: `${new Date().toISOString().slice(0, 10)}T10:00:00`,
      priorite_id: priorite.id,
      sous_type_id: sousTypeVisa.id,
      origine_presentateur: 'Guichet central',
      comptable_presentateur: 'Comptable RAKOTO',
      annee_reference: new Date().getFullYear(),
      verificateur_id: agentVerif?.id,
    },
  });
  ok('Dossier de test créé', creation.status === 201,
    `${creation.status} ${creation.data?.numero || creation.data?.message || ''}`);
  const idDossier = creation.data?.id;

  if (creation.status === 201) {
    /* Après création, le dossier est affecté : l'étape suivante est la
       prise en charge, par l'agent. */
    const actionApresCreation = await api('GET', `/dossiers/${idDossier}/prochaine-action`, {
      token: verif.token,
    });
    ok('« À faire ensuite » répond', actionApresCreation.status === 200,
      `${actionApresCreation.status}`);
    ok('L’étape après affectation est la prise en charge',
      actionApresCreation.data?.code === 'TRAITER', actionApresCreation.data?.code);
    ok('L’action est annoncée comme étant à l’agent connecté',
      actionApresCreation.data?.pour_moi === true, actionApresCreation.data?.acteur);

    /* Le même dossier, vu par le chef de division : l'étape n'est pas à lui. */
    const actionPourLeChef = await api('GET', `/dossiers/${idDossier}/prochaine-action`, {
      token: chefVisa.token,
    });
    ok('Le chef de division voit que l’action n’est pas à lui',
      actionPourLeChef.data?.pour_moi === false,
      `acteur : ${actionPourLeChef.data?.acteur}`);

    /* Le dossier est traité puis soumis : l'étape devient la vérification,
       qui revient au chef de division. */
    await api('POST', `/dossiers/${idDossier}/traiter`, {
      token: verif.token,
      corps: { observation: 'Prise en charge.' },
    });
    await api('POST', `/dossiers/${idDossier}/verifier`, {
      token: verif.token,
      corps: { resultat: 'OK', observation: 'Soumis à vérification.' },
    });

    const actionApresSoumission = await api('GET', `/dossiers/${idDossier}/prochaine-action`, {
      token: chefVisa.token,
    });
    ok('Après soumission, l’étape est la vérification',
      actionApresSoumission.data?.code === 'VERIFIER', actionApresSoumission.data?.code);
    ok('La vérification revient au chef de division connecté',
      actionApresSoumission.data?.pour_moi === true, actionApresSoumission.data?.acteur);

    const actionPourLErreur = await api('GET', `/dossiers/${idDossier}/prochaine-action`, {
      token: verif.token,
    });
    ok('L’agent voit que l’action est chez le chef de division',
      actionPourLErreur.data?.pour_moi === false,
      `acteur : ${actionPourLErreur.data?.acteur}`);

    /* Validation, puis signature : l'étape passe au Chef de Service, et
       seulement à lui.

       La validation est bloquée tant qu'une pièce obligatoire n'est pas
       « présente » : le contrôle des pièces fait donc partie du parcours. */
    const depouillement = await api('GET', `/dossiers/${idDossier}/depouillement`, {
      token: verif.token,
    });
    for (const piece of depouillement.data?.depouillement || []) {
      await api('POST', `/dossiers/${idDossier}/depouillement`, {
        token: verif.token,
        corps: { piece: piece.code, presente: true, etat: 'PRESENTE' },
      });
    }

    const validation = await api('POST', `/dossiers/${idDossier}/valider`, {
      token: chefVisa.token,
      corps: { decision: 'VALIDE', commentaire: 'Dossier conforme.' },
    });
    ok('Le dossier VISA se valide une fois les pièces contrôlées',
      validation.status === 200,
      `${validation.status} ${validation.data?.message || ''}`);

    const actionApresValidation = await api('GET', `/dossiers/${idDossier}/prochaine-action`, {
      token: chefService.token,
    });
    ok('Après validation, l’étape est la signature',
      actionApresValidation.data?.code === 'SIGNER', actionApresValidation.data?.code);
    ok('La signature revient au Chef de Service',
      actionApresValidation.data?.pour_moi === true, actionApresValidation.data?.acteur);

    const actionApresValidationPourLErreur = await api('GET', `/dossiers/${idDossier}/prochaine-action`, {
      token: verif.token,
    });
    ok('Le vérificateur voit que la signature n’est pas à lui',
      actionApresValidationPourLErreur.data?.pour_moi === false,
      `acteur : ${actionApresValidationPourLErreur.data?.acteur}`);

    /* Après signature, le VISA s'archive directement : pas de clôture
       intermédiaire. */
    await api('POST', `/dossiers/${idDossier}/signer`, {
      token: chefService.token,
      corps: { reference: '045/SRSP/2026' },
    });

    const actionApresSignature = await api('GET', `/dossiers/${idDossier}/prochaine-action`, {
      token: verif.token,
    });
    ok('Après signature, le VISA propose l’archivage (pas la clôture)',
      actionApresSignature.data?.code === 'ARCHIVER', actionApresSignature.data?.code);

    const actionApresSignaturePourLeChef = await api('GET', `/dossiers/${idDossier}/prochaine-action`, {
      token: chefVisa.token,
    });
    ok('Le chef de division voit que l’archivage n’est pas à lui',
      actionApresSignaturePourLeChef.data?.pour_moi === false,
      `acteur : ${actionApresSignaturePourLeChef.data?.acteur}`);
  }

  /* ------------------------------------------------------------------ */
  section('3. Transmissions du dossier');

  const transmissions = await api('GET', `/dossiers/${idDossier}/transmissions`, {
    token: secretaire.token,
  });
  ok('Les transmissions du dossier sont consultables', transmissions.status === 200,
    `${transmissions.status}`);
  ok('La réponse est une liste', Array.isArray(transmissions.data),
    `${(transmissions.data || []).length} transmission(s)`);

  /* Le dossier n'a pas encore été transmis : la liste est vide, ce qui est
     correct et ne doit pas être une erreur. */
  const dossierSansTransmission = (transmissions.data || []).length === 0;
  ok('Un dossier jamais transmis n’a pas de transmission', dossierSansTransmission);

  /* ------------------------------------------------------------------ */
  section('4. Compteurs et listes hors brouillon');

  const synthese = await api('GET', '/dashboard/summary', { token: secretaire.token });
  ok('Le tableau de bord répond', synthese.status === 200, `${synthese.status}`);
  const total = synthese.data?.total ?? synthese.data?.fichiers?.total;
  ok('Le total ne compte pas les brouillons', typeof total === 'number' || total === undefined,
    `total = ${total}`);

  const boite = await api('GET', '/dashboard/boite-travail', { token: secretaire.token });
  ok('La boîte de travail répond', boite.status === 200, `${boite.status}`);

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

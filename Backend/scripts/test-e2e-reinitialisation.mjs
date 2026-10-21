/**
 * Test de bout en bout de la réinitialisation de mot de passe.
 *
 * Le circuit complet est éprouvé : demande publique, délivrance du code par
 * l'administrateur, consommation du code, invalidation des sessions.
 *
 * Ce qui doit ÉCHOUER est vérifié autant que ce qui doit réussir :
 *   - la demande ne révèle pas si le compte existe ;
 *   - un code erroné est refusé, et l'état du compte reste intact ;
 *   - un profil non administrateur ne peut pas délivrer de code ;
 *   - après réinitialisation, les sessions ouvertes ne fonctionnent plus.
 *
 * Usage : node scripts/test-e2e-reinitialisation.mjs
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

async function login(identifiant, password) {
  const r = await api('POST', '/auth/login', {
    corps: { identifiant, password },
  });
  if (r.status !== 200) throw new Error(`Connexion ${identifiant} : ${r.status}`);
  return r.data.token;
}

const MOT_DE_PASSE = 'Temoin9!x';

async function main() {
  console.log(`Test de réinitialisation de mot de passe — ${BASE}`);

  const admin = await login('admin', 'Admin123!');
  const cible = await login('secretaire', 'Demo123!');

  /* ------------------------------------------------------------------ */
  section('1. Demande publique');

  const demandeInconnue = await api('POST', '/auth/password/forgot', {
    corps: { identifiant: 'compte-qui-nexiste-pas@srsp.mg' },
  });
  ok('Demande pour un compte inconnu acceptée', demandeInconnue.status === 200,
    `${demandeInconnue.status}`);

  const demandeConnue = await api('POST', '/auth/password/forgot', {
    corps: { identifiant: 'secretaire' },
  });
  ok('Demande pour un compte existant acceptée', demandeConnue.status === 200,
    `${demandeConnue.status}`);

  ok('La réponse est identique dans les deux cas',
    demandeInconnue.data?.message === demandeConnue.data?.message,
    'aucune information révélée');

  const sansIdentifiant = await api('POST', '/auth/password/forgot', { corps: {} });
  ok('Demande sans identifiant refusée (400)', sansIdentifiant.status === 400,
    `${sansIdentifiant.status}`);

  /* ------------------------------------------------------------------ */
  section('2. Traitement par l\'administrateur');

  const liste = await api('GET', '/reinitialisations', { token: admin });
  ok('Demandes listées par l\'administrateur', liste.status === 200,
    `${(liste.data || []).length} demande(s)`);

  const demande = (liste.data || []).find(
    (d) => d.username === 'secretaire' && ['EN_ATTENTE', 'CODE_GENERE'].includes(d.statut)
  );
  ok('Demande du secrétaire retrouvée', Boolean(demande),
    demande ? `statut ${demande.statut}` : '');

  /* Un profil non administrateur ne délivre pas de code. */
  const secretaireListe = await api('GET', '/reinitialisations', { token: cible });
  ok('Liste interdite au secrétaire (403)', secretaireListe.status === 403,
    `${secretaireListe.status}`);

  if (demande) {
    const codeReponse = await api('POST', `/reinitialisations/${demande.id}/code`, {
      token: admin,
      corps: { motif: 'Identité vérifiée au guichet (test).' },
    });
    ok('Code délivré par l\'administrateur', codeReponse.status === 200,
      `${codeReponse.status}`);
    ok('Le code comporte six chiffres', /^[0-9]{6}$/.test(codeReponse.data?.code || ''),
      codeReponse.data?.code);
    ok('Durée de validité annoncée', codeReponse.data?.duree_minutes > 0,
      `${codeReponse.data?.duree_minutes} min`);

    const codeSecretariat = await api('POST', `/reinitialisations/${demande.id}/code`, {
      token: cible,
      corps: {},
    });
    ok('Code refusé au secrétaire (403)', codeSecretariat.status === 403,
      `${codeSecretariat.status}`);

    /* ---------------------------------------------------------------- */
    section('3. Consommation du code');

    const mauvaisCode = await api('POST', '/auth/password/reset', {
      corps: { identifiant: 'secretaire', code: '000000', nouveau_mot_de_passe: MOT_DE_PASSE },
    });
    ok('Code erroné refusé (422)', mauvaisCode.status === 422,
      `${mauvaisCode.status} ${mauvaisCode.data?.message || ''}`);

    const ancienMdP = await login('secretaire', 'Demo123!');
    ok('Mot de passe inchangé après un code erroné', Boolean(ancienMdP));

    const mauvaisIdentifiant = await api('POST', '/auth/password/reset', {
      corps: { identifiant: 'secretaire', code: '123456', nouveau_mot_de_passe: MOT_DE_PASSE },
    });
    ok('Code erroné refusé même avec un identifiant correct (422)',
      mauvaisIdentifiant.status === 422, `${mauvaisIdentifiant.status}`);

    const codeValide = codeReponse.data.code;
    const reinitialisation = await api('POST', '/auth/password/reset', {
      corps: { identifiant: 'secretaire', code: codeValide, nouveau_mot_de_passe: MOT_DE_PASSE },
    });
    ok('Réinitialisation acceptée', reinitialisation.status === 200,
      `${reinitialisation.status} ${reinitialisation.data?.message || ''}`);

    const ancienMotDePasse = await api('POST', '/auth/login', {
      corps: { identifiant: 'secretaire', password: 'Demo123!' },
    });
    ok('Ancien mot de passe refusé', ancienMotDePasse.status === 401,
      `${ancienMotDePasse.status}`);

    const nouveauMotDePasse = await api('POST', '/auth/login', {
      corps: { identifiant: 'secretaire', password: MOT_DE_PASSE },
    });
    ok('Nouveau mot de passe accepté', nouveauMotDePasse.status === 200,
      `${nouveauMotDePasse.status}`);

    /* La session ouverte avant la réinitialisation ne doit plus fonctionner. */
    const sessionPerimee = await api('GET', '/dossiers', { token: cible });
    ok('Session ouverte invalidée par la réinitialisation (401)',
      sessionPerimee.status === 401, `${sessionPerimee.status}`);

    /* Le code ne sert qu'une fois. */
    const reutilisation = await api('POST', '/auth/password/reset', {
      corps: { identifiant: 'secretaire', code: codeValide, nouveau_mot_de_passe: 'Autre9!y' },
    });
    ok('Code non réutilisable (422)', reutilisation.status === 422,
      `${reutilisation.status}`);

    /* ---------------------------------------------------------------- */
    section('4. Mot de passe trop faible');

    const faible = await api('POST', '/auth/password/reset', {
      corps: { identifiant: 'secretaire', code: '123456', nouveau_mot_de_passe: 'azerty' },
    });
    ok('Mot de passe faible refusé (400)', faible.status === 400,
      `${faible.status}`);

    /* ---------------------------------------------------------------- */
    section('5. Remise en état');

    /* Le test a changé le mot de passe d'un compte de démonstration : il le
       remet, sinon la campagne laisserait le service dans un état qu'aucun
       autre test ne suppose. */
    const agents = await api('GET', '/agents', { token: admin });
    const fiche = (agents.data?.agents || agents.data || []).find(
      (a) => a.username === 'secretaire'
    );
    if (fiche) {
      const remise = await api('POST', `/personnel/${fiche.id}/reset-password`, {
        token: admin,
        corps: { password: 'Demo123!' },
      });
      ok('Mot de passe de démonstration rétabli', remise.status === 200,
        `${remise.status}`);
    } else {
      ok('Fiche du secrétaire retrouvée', false, 'introspection impossible');
    }

    const connexionFinale = await api('POST', '/auth/login', {
      corps: { identifiant: 'secretaire', password: 'Demo123!' },
    });
    ok('Compte utilisable avec son mot de passe d\'origine',
      connexionFinale.status === 200, `${connexionFinale.status}`);

    const journal = await api('GET', '/historique?search=REINITIALISATION', { token: admin });
    ok('Réinitialisation journalisée', (journal.data?.actions || []).length > 0,
      `${journal.data?.actions?.length || 0} événement(s)`);
  }

  /* ------------------------------------------------------------------ */
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

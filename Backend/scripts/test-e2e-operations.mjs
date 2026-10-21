/**
 * Test de bout en bout des données d'opération, du versionnage des pièces
 * et de l'état « non applicable ».
 *
 * Trois fonctions demandées par le cahier des fonctionnalités :
 *
 *   1. les **données propres à l'opération** (§ 7.5, § 8.5) — saisies par
 *      l'agent, contrôlées par le chef de division ;
 *   2. la **traçabilité des versions** d'une pièce remplacée (§ 5.2) ;
 *   3. l'état **« non applicable »** d'une pièce (§ 5.2).
 *
 * Usage : node scripts/test-e2e-operations.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

/** Dépôt d'un fichier de test (PDF, seul format texte accepté par le dépôt). */
function fichierTest(nom, contenu = 'contenu de test') {
  return {
    nom,
    contenu: Buffer.from(`%PDF-1.4\n${contenu}\n%%EOF`),
    taille: 0,
  };
}

/** Envoie un fichier au dépôt de pièces jointes. */
async function deposer(token, dossierId, fichier, champs = {}) {
  const forme = new FormData();
  forme.append('fichier', new Blob([fichier.contenu], { type: 'application/pdf' }), fichier.nom);
  for (const [cle, valeur] of Object.entries(champs)) forme.append(cle, String(valeur));
  const r = await fetch(`${BASE}/dossiers/${dossierId}/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: forme,
  });
  const texte = await r.text();
  let data = null;
  try { data = JSON.parse(texte); } catch { data = texte; }
  return { status: r.status, data };
}

let compteur = 0;
const matriculeTest = (prefix = 'T') => {
  compteur += 1;
  return `${prefix}${(Date.now() % 1e7).toString(36).toUpperCase()}${compteur}`.slice(0, 10);
};

async function main() {
  console.log(`Test des données d'opération — ${BASE}`);

  const secretaire = await login('secretaire');
  const verifSolde = await login('verif.solde');
  const chefSolde = await login('chef.solde');
  const chefVisa = await login('chef.visa');

  const ref = await api('GET', '/referentiel', { token: secretaire.token });
  const typeSolde = (ref.data.types_dossiers || []).find((t) => t.code === 'SOLDE');
  const sousTypes = (ref.data.sous_types || []).filter((s) => s.type_dossier_id === typeSolde.id);
  const sousTypeAvance = sousTypes.find((s) => s.code === 'SOLDE_AVANCE');
  const priorite = ref.data.priorites?.[0];

  /* ------------------------------------------------------------------ */
  section('1. Données d\'opération — saisie et contrôle');

  const creation = await api('POST', '/dossiers', {
    token: secretaire.token,
    corps: {
      type_id: typeSolde.id,
      objet: 'Avance de solde — test E2E',
      demandeur: 'TEST Avance',
      demandeur_nom: 'TEST',
      demandeur_prenom: 'Avance',
      matricule: matriculeTest('TA'),
      date_reception: new Date().toISOString().slice(0, 10),
      priorite_id: priorite.id,
      sous_type_id: sousTypeAvance.id,
    },
  });
  ok('Dossier Solde créé avec son type d\'opération', creation.status === 201,
    `${creation.status} ${creation.data?.numero || creation.data?.message || ''}`);
  const idDossier = creation.data?.id;

  /* La saisie d'un montant par l'agent qui instruit. Les champs propres de
     l'opération (durée, décompte validé) sont exigés : le serveur contrôle
     l'obligation, l'écran ne fait que la proposer. */
  const saisie = await api('PUT', `/dossiers/${idDossier}/operation`, {
    token: verifSolde.token,
    corps: {
      reference_externe: 'BC-2026-0001',
      reference_dossier_mere: 'DM-RAKOTO',
      periode: '2026-01 à 2026-06',
      montant: 250000.00,
      source_montant: 'Saisie de l\'agent, sur la base des relevés',
      duree_mois: 6,
      decompte_valide: 250000,
      observation: 'Demande d\'avance de six mois.',
    },
  });
  ok('Le vérificateur saisit les données de l\'opération', saisie.status === 200,
    `${saisie.status} ${saisie.data?.message || ''}`);
  ok('Le montant saisi est conservé', Number(saisie.data?.montant) === 250000,
    `${saisie.data?.montant}`);
  ok('La source du montant est conservée', Boolean(saisie.data?.source_montant),
    saisie.data?.source_montant);
  ok('Le type d\'opération est repris du dossier',
    Number(saisie.data?.sous_type_id) === Number(sousTypeAvance.id),
    saisie.data?.sous_type_code);

  /* Le secrétaire n'a pas le droit de saisir : il n'instruit pas. */
  const saisieParSecretaire = await api('PUT', `/dossiers/${idDossier}/operation`, {
    token: secretaire.token,
    corps: { observation: 'tentative' },
  });
  ok('Saisie refusée à un profil sans la permission (403)',
    saisieParSecretaire.status === 403,
    `${saisieParSecretaire.status} ${saisieParSecretaire.data?.message || ''}`);

  /* Le contrôle par le chef de division. */
  const lectureAvant = await api('GET', `/dossiers/${idDossier}/operation`, { token: chefSolde.token });
  ok('Les données sont lisibles par le chef de division', lectureAvant.status === 200,
    `${lectureAvant.status}`);

  const controle = await api('POST', `/dossiers/${idDossier}/operation/controler`, {
    token: chefSolde.token,
    corps: { decision: 'APPROUVE', observations: 'Montant vérifié sur les relevés.' },
  });
  ok('Le chef de division contrôle l\'opération', controle.status === 200,
    `${controle.status} ${controle.data?.message || ''}`);
  ok('La décision de contrôle est conservée',
    controle.data?.decision_controle === 'APPROUVE', controle.data?.decision_controle);
  ok('Le contrôleur est identifié', Boolean(controle.data?.controleur_username),
    controle.data?.controleur_username);

  const controleParAgent = await api('POST', `/dossiers/${idDossier}/operation/controler`, {
    token: verifSolde.token,
    corps: { decision: 'APPROUVE' },
  });
  ok('Contrôle refusé à l\'agent qui a saisi (403)', controleParAgent.status === 403,
    `${controleParAgent.status}`);

  /* La validation d'un montant. */
  const validation = await api('POST', `/dossiers/${idDossier}/operation/valider`, {
    token: chefSolde.token,
    corps: { observations: 'Montant validé.' },
  });
  ok('Le montant se valide', validation.status === 200,
    `${validation.status} ${validation.data?.message || ''}`);
  ok('La validation est datée et attribuée', Boolean(validation.data?.valide_par_username),
    validation.data?.valide_par_username);

  /* Un montant non saisi n'a rien à valider. */
  const sansMontant = await api('POST', '/dossiers', {
    token: secretaire.token,
    corps: {
      type_id: typeSolde.id,
      objet: 'Opération sans montant',
      demandeur: 'TEST Sans Montant',
      demandeur_nom: 'TEST',
      demandeur_prenom: 'Sans',
      matricule: matriculeTest('TM'),
      date_reception: new Date().toISOString().slice(0, 10),
      priorite_id: priorite.id,
      sous_type_id: sousTypes.find((s) => s.code === 'SOLDE_DOSSIERE_MERE')?.id,
    },
  });
  if (sansMontant.status === 201) {
    const validationSansMontant = await api('POST', `/dossiers/${sansMontant.data.id}/operation/valider`, {
      token: chefSolde.token,
      corps: {},
    });
    ok('Un montant non saisi ne se valide pas (422)',
      validationSansMontant.status === 422,
      `${validationSansMontant.status} ${validationSansMontant.data?.message || ''}`);
  } else {
    ok('Dossier sans montant créé', false, `${sansMontant.status} ${sansMontant.data?.message || ''}`);
  }

  /* ------------------------------------------------------------------ */
  section('2. Pièces — état « non applicable »');

  const dep = await api('GET', `/dossiers/${idDossier}/depouillement`, { token: verifSolde.token });
  const pieces = dep.data?.depouillement || [];
  ok('Des pièces de dépouillement sont configurées pour le Solde', pieces.length > 0,
    `${pieces.length}`);

  if (pieces.length) {
    const nonApplicable = await api('POST', `/dossiers/${idDossier}/depouillement`, {
      token: verifSolde.token,
      corps: { piece: pieces[0].code, presente: true, etat: 'NON_APPLICABLE' },
    });
    ok('L\'état « non applicable » est accepté sans motif',
      nonApplicable.status === 200,
      `${nonApplicable.status} ${nonApplicable.data?.message || ''}`);

    const relu = await api('GET', `/dossiers/${idDossier}/depouillement`, { token: verifSolde.token });
    const etat = (relu.data?.depouillement || []).find((p) => p.code === pieces[0].code);
    ok('L\'état « non applicable » est conservé', etat?.etat === 'NON_APPLICABLE', etat?.etat);

    /* Une pièce non applicable ne bloque pas la validation : elle satisfait
       l'obligation, puisque la pièce n'avait pas à être fournie. */
    const resume = relu.data?.resume;
    ok('La pièce non applicable compte comme satisfaite',
      resume?.par_phase?.DEPOUILLEMENT?.presentes >= 1,
      `${resume?.par_phase?.DEPOUILLEMENT?.presentes}/${resume?.par_phase?.DEPOUILLEMENT?.total}`);

    /* Les autres états demandent toujours un motif. */
    const manquanteSansMotif = await api('POST', `/dossiers/${idDossier}/depouillement`, {
      token: verifSolde.token,
      corps: { piece: pieces[0].code, presente: false, etat: 'MANQUANTE' },
    });
    ok('L\'état « manquante » exige toujours un motif (422)',
      manquanteSansMotif.status === 422, `${manquanteSansMotif.status}`);
  }

  /* ------------------------------------------------------------------ */
  section('2 bis. Schéma d\'opération — formulaire piloté par la configuration');

  const lectureSchema = await api('GET', `/dossiers/${idDossier}/operation`, {
    token: verifSolde.token,
  });
  ok('Le schéma de l\'opération est renvoyé', lectureSchema.status === 200,
    `${lectureSchema.status}`);
  ok('L\'opération est identifiée', Boolean(lectureSchema.data?.operation?.code),
    lectureSchema.data?.operation?.code);
  ok('Le schéma liste des champs', (lectureSchema.data?.schema || []).length > 0,
    `${(lectureSchema.data?.schema || []).length} champ(s)`);

  /* Les champs propres de l'opération Solde doivent être là : c'est ce qui
     distingue un formulaire générique d'un formulaire d'opération. */
  const cles = (lectureSchema.data?.schema || []).map((c) => c.cle);
  ok('Le schéma contient les champs propres de l\'avance de solde',
    cles.includes('duree_mois') && cles.includes('decompte_valide'),
    cles.filter((c) => c.includes('avance') || c.includes('decompte')).join(', '));
  ok('Le schéma contient les champs communs',
    cles.includes('reference_externe') && cles.includes('montant'),
    `${cles.length} champ(s) au total`);

  /* Un champ obligatoire manquant doit être refusé par le serveur : la règle
     de gestion ne se contourne pas en contournant l'écran. */
  const champs = lectureSchema.data?.schema || [];
  const requis = champs.find((c) => c.requis && c.cle !== 'reference_externe');
  if (requis) {
    const saisieIncomplete = await api('PUT', `/dossiers/${idDossier}/operation`, {
      token: verifSolde.token,
      corps: { valeurs: { [requis.cle]: '' } },
    });
    ok('Un champ obligatoire manquant est refusé (422)',
      saisieIncomplete.status === 422,
      `${saisieIncomplete.status} ${saisieIncomplete.data?.message || ''}`);
  } else {
    ok('Un champ obligatoire est déclaré dans le schéma', false, 'aucun champ requis');
  }

  /* La saisie par le schéma : les valeurs propres sont enregistrées et
     relues. */
  const saisieSchema = await api('PUT', `/dossiers/${idDossier}/operation`, {
    token: verifSolde.token,
    corps: {
      valeurs: {
        reference_externe: 'BC-2026-0001',
        duree_mois: 6,
        decompte_valide: 250000,
        taux_retenue: 10,
        observation: 'Avance de six mois, décompte validé sur relevés.',
      },
    },
  });
  ok('La saisie suit le schéma', saisieSchema.status === 200,
    `${saisieSchema.status} ${saisieSchema.data?.message || ''}`);

  const relecture = await api('GET', `/dossiers/${idDossier}/operation`, {
    token: verifSolde.token,
  });
  const valeurs = relecture.data?.valeurs || {};
  ok('Le champ propre est relu', String(valeurs.duree_mois) === '6',
    `duree_mois = ${valeurs.duree_mois}`);
  ok('Le champ numérique propre est relu',
    String(valeurs.decompte_valide) === '250000',
    `decompte_valide = ${valeurs.decompte_valide}`);
  ok('Le champ commun est relu', valeurs.reference_externe === 'BC-2026-0001',
    valeurs.reference_externe);

  /* Un champ absent du schéma est ignoré : le serveur n'accepte pas un
     champ que l'écran ne montre pas. Les champs obligatoires de l'opération
     sont de nouveau fournis : leur absence serait refusée avant même
     d'atteindre le champ inconnu. */
  const saisieEtrange = await api('PUT', `/dossiers/${idDossier}/operation`, {
    token: verifSolde.token,
    corps: {
      valeurs: {
        duree_mois: 6,
        decompte_valide: 250000,
        champ_qui_nexiste_pas: 'valeur',
      },
    },
  });
  ok('Un champ inconnu est accepté mais ignoré', saisieEtrange.status === 200,
    `${saisieEtrange.status}`);

  const apresEtrange = await api('GET', `/dossiers/${idDossier}/operation`, {
    token: verifSolde.token,
  });
  ok('Le champ inconnu n\'est pas enregistré',
    apresEtrange.data?.valeurs?.champ_qui_nexiste_pas === undefined);

  /* ------------------------------------------------------------------ */
  section('3. Pièces jointes — versionnage et remplacement');

  const dep1 = await deposer(verifSolde.token, idDossier,
    fichierTest('avance-v1.pdf'));
  ok('Premier dépôt de pièce', dep1.status === 201,
    `${dep1.status} ${dep1.data?.message || ''}`);
  ok('Premier dépôt : version 1', Number(dep1.data?.version) === 1, `v${dep1.data?.version}`);

  /* Une pièce du dépouillement, pour déclencher le versionnage. */
  const pieceCode = pieces[0]?.code;
  if (pieceCode) {
    const v1 = await deposer(verifSolde.token, idDossier,
      fichierTest('piece-v1.pdf'), { piece_code: pieceCode });
    ok('Dépôt d\'une pièce du dépouillement', v1.status === 201, `${v1.status}`);
    ok('Version 1 enregistrée', Number(v1.data?.version) === 1, `v${v1.data?.version}`);

    const v2 = await deposer(verifSolde.token, idDossier,
      fichierTest('piece-v2.pdf'),
      { piece_code: pieceCode, motif_remplacement: 'Acte rectifié par le demandeur.' });
    ok('Second dépôt : version 2', v2.status === 201 && Number(v2.data?.version) === 2,
      `${v2.status} v${v2.data?.version}`);
    ok('Le motif du remplacement est conservé', Boolean(v2.data?.motif_remplacement),
      v2.data?.motif_remplacement);
    ok('La version précédente est liée', Boolean(v2.data?.remplace),
      `remplace = ${v2.data?.remplace}`);

    /* La version 1 existe toujours. */
    const documents = await api('GET', `/dossiers/${idDossier}/documents`, { token: verifSolde.token });
    const versions = (documents.data || []).filter((d) => d.piece_code === pieceCode);
    ok('Les deux versions sont conservées', versions.length === 2,
      `${versions.length} version(s)`);

    /* Une version antérieure ne se supprime pas. */
    const ancienne = versions.find((v) => Number(v.version) === 1);
    const suppression = await api('DELETE', `/dossiers/${idDossier}/documents/${ancienne.id}`, {
      token: verifSolde.token,
    });
    ok('La suppression d\'une version antérieure est refusée (409)',
      suppression.status === 409,
      `${suppression.status} ${suppression.data?.message || ''}`);
  } else {
    ok('Une pièce du dépouillement est disponible', false, 'aucune pièce listée');
  }

  /* ------------------------------------------------------------------ */
  section('4. Correspondances — suivi et transmission centrale');

  /* Les correspondances sont une fonction de la division Pensions : c'est
     là que se préparent les prescriptions, les oppositions et les derniers
     arrérages. */
  const chefPension = await login('chef.pension');
  const liquidateur = await login('liquidateur');
  const typePension = (ref.data.types_dossiers || []).find((t) => t.code === 'PENSION');
  const sousTypeOpposition = (ref.data.sous_types || []).find(
    (s) => s.type_dossier_id === typePension.id && s.code === 'PENSION_OPPOSITION'
  );

  const dossierPension = await api('POST', '/dossiers', {
    token: secretaire.token,
    corps: {
      type_id: typePension.id,
      objet: 'Opposition sur pension — test E2E',
      demandeur: 'TEST Opposition',
      demandeur_nom: 'TEST',
      demandeur_prenom: 'Opposition',
      matricule: matriculeTest('TO'),
      date_reception: new Date().toISOString().slice(0, 10),
      priorite_id: priorite.id,
      sous_type_id: sousTypeOpposition?.id,
    },
  });
  ok('Dossier Pensions créé', dossierPension.status === 201,
    `${dossierPension.status} ${dossierPension.data?.numero || ''}`);

  const correspondance = await api('POST', '/correspondances', {
    token: liquidateur.token,
    corps: {
      dossier_id: dossierPension.data?.id,
      type: 'OPPOSITION_PENSION_ALIMENTAIRE',
      reference: 'OPP-2026-0001',
      destinataire: 'Level central',
      objet: 'Opposition sur pension alimentaire',
      contenu: 'Opposition à signifier pour la pension alimentaire.',
      etat: 'ENVOYEE',
      date_transmission_central: new Date().toISOString().slice(0, 19).replace('T', ' '),
      destinataire_central: 'Direction centrale',
      reference_bordereau: 'BORD-CENTRAL-0001',
    },
  });
  ok('La correspondance est créée', correspondance.status === 201,
    `${correspondance.status} ${correspondance.data?.message || ''}`);
  ok('La référence est conservée', correspondance.data?.reference === 'OPP-2026-0001',
    correspondance.data?.reference);
  ok('La transmission centrale est tracée',
    Boolean(correspondance.data?.date_transmission_central),
    correspondance.data?.date_transmission_central);

  const suivi = await api('PUT', `/correspondances/${correspondance.data?.id}`, {
    token: liquidateur.token,
    corps: {
      etat_reponse: 'ACCUSEE',
      date_reponse: new Date().toISOString().slice(0, 19).replace('T', ' '),
      reponse: 'Accusé de réception reçu du niveau central.',
      etat_reception_central: 'RECU',
    },
  });
  ok('Le suivi de la correspondance se met à jour', suivi.status === 200,
    `${suivi.status} ${suivi.data?.message || ''}`);
  ok('L\'état de réponse est conservé', suivi.data?.etat_reponse === 'ACCUSEE',
    suivi.data?.etat_reponse);
  ok('L\'état de réception centrale est conservé',
    suivi.data?.etat_reception_central === 'RECU', suivi.data?.etat_reception_central);

  const listage = await api('GET', `/correspondances?dossier_id=${dossierPension.data?.id}`, {
    token: chefPension.token,
  });
  ok('Les correspondances sont listables par le chef de division',
    listage.status === 200, `${listage.status}`);
  ok('La correspondance figure dans la liste',
    (listage.data || []).some((c) => c.reference === 'OPP-2026-0001'));

  /* ------------------------------------------------------------------ */
  section('5. Cloisonnement par division');

  const lectureParVisa = await api('GET', `/dossiers/${idDossier}/operation`, {
    token: chefVisa.token,
  });
  ok('Un chef d\'autre division ne lit pas les données d\'opération (403/404)',
    lectureParVisa.status === 403 || lectureParVisa.status === 404,
    `${lectureParVisa.status}`);

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

/**
 * Vérifications ponctuelles des endpoints consommés par le frontend.
 *
 * Complète la campagne VISA : celle-ci éprouve le circuit métier, celle-ci
 * vérifie que chaque écran affiché a bien la donnée qu'il attend.
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api';

let ok = 0;
let ko = 0;
const check = (nom, cond, detail = '') => {
  if (cond) { ok += 1; console.log(`  OK   ${nom}${detail ? ` — ${detail}` : ''}`); }
  else { ko += 1; console.error(`  ECHEC ${nom}${detail ? ` — ${detail}` : ''}`); }
};

async function login(identifiant, password = 'Demo123!') {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password }),
  });
  const d = await r.json();
  return d.token;
}

async function get(token, chemin) {
  const r = await fetch(`${BASE}${chemin}`, { headers: { Authorization: `Bearer ${token}` } });
  const text = await r.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: r.status, data };
}

const admin = await login('admin', 'Admin123!');
const secretaire = await login('secretaire');
const chefVisa = await login('chef.visa');

console.log('\n=== Écrans et leurs données ===');

const ref = await get(secretaire, '/referentiel');
check('Référentiel : types de dossiers', (ref.data?.types_dossiers || []).length > 0);
check('Référentiel : sous-types', (ref.data?.sous_types || []).length > 0);
check('Référentiel : types de pièces', (ref.data?.types_pieces || []).length > 0);
check('Référentiel : statuts', (ref.data?.statuts || []).length > 0);

const liste = await get(secretaire, '/dossiers');
check('Liste des dossiers', liste.status === 200, `${(liste.data || []).length} ligne(s)`);

const withFilters = await get(
  secretaire,
  '/dossiers?type=VISA&statut=VALIDE&search=visa&date_debut=2020-01-01&date_fin=2030-12-31&tri=ancien'
);
check('Liste filtrée (type, statut, recherche, période, tri)', withFilters.status === 200,
  `${(withFilters.data || []).length} ligne(s)`);

const withDivision = await get(secretaire, '/dossiers?division_id=1');
check('Filtre par division', withDivision.status === 200,
  `${(withDivision.data || []).length} ligne(s)`);

const withAgent = await get(secretaire, '/dossiers?agent_id=1');
check('Filtre par responsable', withAgent.status === 200,
  `${(withAgent.data || []).length} ligne(s)`);

const dossierId = (liste.data || [])[0]?.id;
if (dossierId) {
  const detail = await get(secretaire, `/dossiers/${dossierId}`);
  check('Détail d\'un dossier', detail.status === 200, detail.data?.numero);
  check('Détail : ancienneté calculée', detail.data?.age_jours !== undefined,
    `${detail.data?.age_jours} j`);
  check('Détail : nom de division', Boolean(detail.data?.division_nom));

  const docs = await get(secretaire, `/dossiers/${dossierId}/documents`);
  check('Pièces jointes du dossier', docs.status === 200,
    `${(docs.data || []).length} pièce(s)`);

  const dep = await get(secretaire, `/dossiers/${dossierId}/depouillement`);
  check('Dépouillement du dossier', dep.status === 200,
    `résumé ${dep.data?.resume?.presentes}/${dep.data?.resume?.total}`);

  const hist = await get(secretaire, `/dossiers/${dossierId}/tracabilite`);
  check('Traçabilité du dossier', hist.status === 200);
}

const boite = await get(chefVisa, '/dashboard/boite-travail');
check('Boîte de travail', boite.status === 200,
  `${boite.data?.a_traiter_par_moi?.total ?? 0} à traiter`);
check('Boîte de travail : incomplets', Array.isArray(boite.data?.incomplets?.dossiers));
check('Boîte de travail : total par catégorie', Array.isArray(boite.data?.par_categorie));
check('Boîte de travail : total par statut', Array.isArray(boite.data?.par_statut));
check('Boîte de travail : périmètre', Boolean(boite.data?.perimetre?.type),
  boite.data?.perimetre?.type);

const suppressions = await get(admin, '/dossiers/suppressions');
check('Trace des suppressions', suppressions.status === 200,
  `${(suppressions.data || []).length} suppression(s)`);

const sousTypes = await get(admin, '/referentiel/sous-types');
check('Sous-types (écran Référentiel)', sousTypes.status === 200,
  `${(sousTypes.data || []).length} ligne(s)`);
check('Sous-types : décompte des dossiers', (sousTypes.data || []).every((s) => s.nb_dossiers !== undefined));

const pieces = await get(admin, '/referentiel/types-pieces');
check('Types de pièces (écran Référentiel)', pieces.status === 200,
  `${(pieces.data || []).length} ligne(s)`);
check('Types de pièces : périmètre type/acte', (pieces.data || []).every((p) => p.type_code !== undefined));

const histGlobal = await get(admin, '/historique?limit=5');
check('Journal d\'audit', histGlobal.status === 200,
  `${histGlobal.data?.total ?? 0} événement(s)`);

const agents = await get(secretaire, '/agents');
check('Liste des agents (filtre responsable)', agents.status === 200);

const divisions = await get(secretaire, '/divisions');
check('Liste des divisions (filtre division)', divisions.status === 200);

/* ── Écran « Schémas d'opérations » (Référentiel) ───────────────────────
   Ce que l'écran attend : la liste des schémas, et la liste des opérations
   qui n'en ont pas encore — sans elle, l'administrateur croirait que le
   module est complet alors que la moitié des formulaires est générique. */
const schemas = await get(admin, '/referentiel/schemas-operations');
check('Schémas d\'opérations (écran Référentiel)', schemas.status === 200,
  `${(schemas.data?.schemas || []).length} opération(s)`);
check('Schémas : chaque opération porte ses champs',
  (schemas.data?.schemas || []).every((s) => Array.isArray(s.champs)));
check('Schémas : chaque champ a sa clé et son libellé',
  (schemas.data?.schemas || []).every((s) =>
    s.champs.every((c) => c.cle && c.libelle && c.type_champ)));
check('Schémas : les opérations sans schéma sont signalées',
  Array.isArray(schemas.data?.operations_sans_schema),
  `${(schemas.data?.operations_sans_schema || []).length} opération(s) sans schéma`);

/* Un profil sans la permission ne voit pas l'écran : c'est une donnée de
   configuration, pas une donnée de dossier. */
const schemasSecretaire = await get(secretaire, '/referentiel/schemas-operations');
check('Schémas : hors périmètre pour un profil non administrateur (403)',
  schemasSecretaire.status === 403, `${schemasSecretaire.status}`);

/* ── Écran « Immatriculations » (Coordination) ─────────────────────────
   L'écran attend : la liste, et les volumes par type de demande. */
const coordination = await login('coordinatrice');
const imma = await get(coordination, '/immatriculations');
check('Immatriculations (écran Coordination)', imma.status === 200,
  `${(imma.data || []).length} ligne(s)`);
check('Immatriculations : la référence attribuée est présente',
  (imma.data || []).every((i) => i.matricule !== undefined));

const volumes = await get(coordination, '/immatriculations/volumes');
check('Immatriculations : volumes par type de demande',
  Array.isArray(volumes.data?.par_type), `${(volumes.data?.par_type || []).length} type(s)`);
check('Immatriculations : volumes par division',
  Array.isArray(volumes.data?.par_division));
check('Immatriculations : volumes par mois',
  Array.isArray(volumes.data?.par_mois));

const immaSecretaire = await get(secretaire, '/immatriculations');
check('Immatriculations : hors périmètre pour un profil sans la permission (403)',
  immaSecretaire.status === 403, `${immaSecretaire.status}`);

/* ── Écran « Territoire » (géographie) ───────────────────────────────────
   L'écran attend : le référentiel territorial (antennes et districts), la
   synthèse par antenne, et la cohérence des totaux — les dossiers sans
   district sont comptés à part, jamais perdus. */
const geoReferentiel = await get(admin, '/geographie/referentiel');
check('Territoire : le référentiel territorial', geoReferentiel.status === 200,
  `${(geoReferentiel.data?.antennes || []).length} antenne(s), `
  + `${(geoReferentiel.data?.districts || []).length} district(s)`);
check('Territoire : les antennes portent leur libellé',
  (geoReferentiel.data?.antennes || []).every((a) => a.libelle));

const geoSynthese = await get(admin, '/geographie/synthese');
check('Territoire : la synthèse par antenne', geoSynthese.status === 200);
check('Territoire : les dossiers sans district sont comptés à part',
  typeof geoSynthese.data?.dossiers_sans_district === 'number',
  `${geoSynthese.data?.dossiers_sans_district} sans district`);
check('Territoire : le total general se retrouve dans la synthese',
  Number(geoSynthese.data?.total)
  === Number(geoSynthese.data?.dossiers_rattaches) + Number(geoSynthese.data?.dossiers_sans_district),
  `${geoSynthese.data?.dossiers_rattaches} rattachés + ${geoSynthese.data?.dossiers_sans_district} sans district `
  + `= ${geoSynthese.data?.total}`);

/* ── Écran « Performance » ───────────────────────────────────────────────
   L'écran attend : les indicateurs, les dossiers en retard, la répartition
   par division et par agent, et l'évolution sur douze mois. */
const perfStats = await get(admin, '/performance/stats');
check('Performance : les indicateurs globaux', perfStats.status === 200,
  `${perfStats.data?.total_dossiers} dossier(s)`);

/* Le total de la performance exclut les brouillons — c'est la même règle que
   celle du tableau de bord. On s'appuie donc sur lui pour la comparaison :
   la synthèse territoriale, elle, exclut en outre les dossiers archivés. */
const resume = await get(admin, '/dashboard/summary');
check('Performance : le total exclut les brouillons',
  Number(perfStats.data?.total_dossiers) === Number(resume.data?.total),
  `${perfStats.data?.total_dossiers} vs ${resume.data?.total}`);
check('Performance : le delai moyen est un nombre ou null',
  perfStats.data?.delai_moyen_traitement === null
  || typeof perfStats.data?.delai_moyen_traitement === 'number');

const perfRetard = await get(admin, '/performance/en-retard');
check('Performance : les dossiers en retard', perfRetard.status === 200,
  `${(perfRetard.data || []).length} dossier(s)`);
check('Performance : un dossier en retard porte son nombre de jours',
  (perfRetard.data || []).every((d) => typeof d.jours_retard === 'number'));

const perfDivision = await get(admin, '/performance/par-division');
check('Performance : la repartition par division', perfDivision.status === 200,
  `${(perfDivision.data || []).length} division(s)`);
check('Performance : la somme par division retrouve le total',
  (perfDivision.data || []).reduce((s, d) => s + Number(d.total), 0)
  === Number(perfStats.data?.total_dossiers));

const perfAgent = await get(admin, '/performance/par-agent');
check('Performance : la repartition par agent', perfAgent.status === 200,
  `${(perfAgent.data || []).length} agent(s)`);

const perfEvolution = await get(admin, '/performance/evolution');
check('Performance : l\'evolution sur douze mois', perfEvolution.status === 200,
  `${(perfEvolution.data || []).length} mois`);
check('Performance : le mois est au format AAAA-MM',
  (perfEvolution.data || []).every((m) => /^\d{4}-\d{2}$/.test(m.mois)));

console.log(`\nRésultat : ${ok} vérification(s) réussie(s), ${ko} échec(s).`);
process.exit(ko === 0 ? 0 : 1);

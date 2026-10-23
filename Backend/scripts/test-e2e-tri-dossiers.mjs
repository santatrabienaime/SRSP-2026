/**
 * Triage des dossiers — tris et regroupement par statut.
 *
 * Un tri n'est qu'un ordre d'affichage : il ne doit ni changer le contenu
 * d'une liste, ni perdre de dossier, ni renvoyer une erreur. Ce script
 * vérifie, sur l'API réelle et la base réelle, que chaque tri classe
 * effectivement les dossiers dans l'ordre annoncé, et que la boîte de
 * travail accepte le même tri que la liste.
 *
 * Usage (depuis Backend/) :
 *   node scripts/test-e2e-tri-dossiers.mjs
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api';
const db = (await import('../src/config/db.js')).default;

let ok = 0;
let ko = 0;
const check = (nom, cond, detail = '') => {
  if (cond) { ok += 1; console.log(`  OK   ${nom}${detail ? ` — ${detail}` : ''}`); }
  else { ko += 1; console.error(`  ECHEC ${nom}${detail ? ` — ${detail}` : ''}`); }
};

async function login(identifiant, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password }),
  });
  const data = await r.json();
  if (!data.token) throw new Error(`Connexion impossible : ${JSON.stringify(data)}`);
  return data.token;
}

const get = async (chemin, token) => {
  const r = await fetch(`${BASE}${chemin}`, { headers: { Authorization: `Bearer ${token}` } });
  return { status: r.status, data: await r.json() };
};

/* L'ordre du circuit : celui de la colonne `ordre` de `statuts_dossiers`. */
const statuts = await db.query('SELECT code, ordre FROM statuts_dossiers');
const RANG = new Map(statuts.map((s) => [s.code, Number(s.ordre)]));

/* Les niveaux de priorité, pour vérifier un tri qui n'est pas alphabétique. */
const priorites = await db.query('SELECT libelle, niveau FROM priorites');
const NIVEAU = new Map(priorites.map((p) => [p.libelle, Number(p.niveau)]));

/**
 * La suite est-elle monotone (croissante ou décroissante) ?
 *
 * Le texte est comparé sur une clé normalisée : la base classe le texte sans
 * tenir compte de la casse ni des accents (collation `ci`), et une
 * comparaison JavaScript brute jugerait « RAKOTO » et « randria » à
 * l'inverse de la base. Les rangs numériques sont comparés comme des
 * nombres.
 */
const cle = (valeur) =>
  String(valeur ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function monotone(valeurs, sens = 'asc', normaliser = cle) {
  for (let i = 1; i < valeurs.length; i += 1) {
    const precedent = normaliser(valeurs[i - 1]);
    const courant = normaliser(valeurs[i]);
    if (sens === 'asc' && courant < precedent) return false;
    if (sens === 'desc' && courant > precedent) return false;
  }
  return true;
}

/** Monotonie sur des nombres (rangs, niveaux). */
const monotoneNombre = (valeurs, sens = 'asc') => monotone(valeurs, sens, (v) => Number(v));

const token = await login('admin@srsp.mg', 'Admin123!');
console.log('\n=== Triage des dossiers ===\n');

/* La liste complète, sans tri : elle sert de témoin. */
const base = await get('/dossiers', token);
check('Liste de référence : 200', base.status === 200);
const dossiers = base.data || [];
check('Liste de référence : non vide', dossiers.length > 0, `${dossiers.length} dossier(s)`);

/* — Tri par statut du circuit — */
const parStatut = await get('/dossiers?tri=statut', token);
check('tri=statut : 200', parStatut.status === 200);
check('tri=statut : aucun dossier perdu', (parStatut.data || []).length === dossiers.length,
  `${(parStatut.data || []).length} vs ${dossiers.length}`);
check('tri=statut : les statuts suivent l’ordre du circuit',
  monotoneNombre((parStatut.data || []).map((d) => RANG.get(d.statut_code) ?? 99)),
  (parStatut.data || []).map((d) => d.statut_code).join(' → '));

/* — Tri par statut, sens inverse — */
const parStatutDesc = await get('/dossiers?tri=statut_desc', token);
check('tri=statut_desc : 200', parStatutDesc.status === 200);
check('tri=statut_desc : les statuts suivent l’ordre inverse du circuit',
  monotoneNombre((parStatutDesc.data || []).map((d) => RANG.get(d.statut_code) ?? -1), 'desc'));

/* — Tri par priorité — */
const parPriorite = await get('/dossiers?tri=priorite', token);
check('tri=priorite : 200', parPriorite.status === 200);
check('tri=priorite : les priorités décroissent',
  monotoneNombre((parPriorite.data || []).map((d) => NIVEAU.get(d.priorite_libelle) ?? 0), 'desc'),
  (parPriorite.data || []).map((d) => d.priorite_libelle).join(' → '));

/* — Tri par niveau de priorité — */
const parNiveau = await get('/dossiers?tri=niveau', token);
check('tri=niveau : 200', parNiveau.status === 200);
check('tri=niveau : aucun dossier perdu', (parNiveau.data || []).length === dossiers.length);
check('tri=niveau : les niveaux décroissent (urgent d’abord)',
  monotoneNombre((parNiveau.data || []).map((d) => Number(d.priorite_niveau) || 0), 'desc'),
  (parNiveau.data || []).map((d) => `${d.priorite_libelle}(${d.priorite_niveau})`).join(' → '));

const parNiveauAsc = await get('/dossiers?tri=niveau_asc', token);
check('tri=niveau_asc : 200', parNiveauAsc.status === 200);
check('tri=niveau_asc : les niveaux croissent (faible d’abord)',
  monotoneNombre((parNiveauAsc.data || []).map((d) => Number(d.priorite_niveau) || 0), 'asc'));

/* — Filtre par niveau de priorité — */
const niveauxConnus = [...new Set([...NIVEAU.values()])].sort((a, b) => b - a);
const niveauTeste = niveauxConnus[0];
const filtreNiveau = await get(`/dossiers?niveau=${niveauTeste}`, token);
check('filtre niveau : 200', filtreNiveau.status === 200);
check('filtre niveau : tous les dossiers portent le niveau demandé',
  (filtreNiveau.data || []).every((d) => Number(d.priorite_niveau) === Number(niveauTeste)),
  `${(filtreNiveau.data || []).length} dossier(s) au niveau ${niveauTeste}`);
check('filtre niveau : le filtre ne perd pas de dossier du niveau',
  (filtreNiveau.data || []).length === dossiers.filter((d) => Number(d.priorite_niveau) === Number(niveauTeste)).length);

/* — Dernier mouvement : la circulation est lisible dans la liste — */
check('dernier mouvement : le champ est exposé pour chaque dossier',
  dossiers.every((d) => 'dernier_mouvement' in d && 'derniere_action_libelle' in d));
check('dernier mouvement : les actes sont traduits en libellés',
  dossiers.filter((d) => d.dernier_mouvement).every((d) => typeof d.derniere_action_libelle === 'string' && d.derniere_action_libelle.length > 0));

/* — Tri par type de dossier — */
const parType = await get('/dossiers?tri=type', token);
check('tri=type : 200', parType.status === 200);
check('tri=type : les types sont classés par libellé',
  monotone((parType.data || []).map((d) => d.type_libelle || '')));

/* — Tri par demandeur — */
const parDemandeur = await get('/dossiers?tri=demandeur', token);
const demandes = (parDemandeur.data || [])
  .map((d) => d.demandeur_nom)
  .filter((v) => v !== null && v !== undefined && v !== '');
check('tri=demandeur : 200', parDemandeur.status === 200);
check('tri=demandeur : les noms sont classés par ordre alphabétique',
  monotone(demandes),
  demandes.join(' → '));

/* — Tri par ancienneté (réception) — */
const parAge = await get('/dossiers?tri=ancien', token);
const receptions = (parAge.data || []).map((d) => d.date_reception || '');
check('tri=ancien : 200', parAge.status === 200);
check('tri=ancien : les réceptions sont croissantes', monotone(receptions));

/* — Les dossiers signalés d'abord — */
const signalements = await db.query(
  `SELECT dossier_id FROM signalements_dossier WHERE statut IN ('OUVERT', 'EN_COURS')`
);
const idsSignales = new Set(signalements.map((r) => Number(r.dossier_id)));
const parSignalement = await get('/dossiers?tri=signalement', token);
check('tri=signalement : 200', parSignalement.status === 200);
check('tri=signalement : aucun dossier perdu',
  (parSignalement.data || []).length === dossiers.length);
if (idsSignales.size > 0) {
  const liste = parSignalement.data || [];
  const indicesSignales = liste
    .map((d, i) => (idsSignales.has(Number(d.id)) ? i : -1))
    .filter((i) => i >= 0);
  const dernierSignale = indicesSignales.length ? Math.max(...indicesSignales) : -1;
  const premierNonSignale = liste.findIndex((d) => !idsSignales.has(Number(d.id)));
  check('tri=signalement : les dossiers signalés viennent d’abord',
    premierNonSignale === -1 || dernierSignale < premierNonSignale,
    `${idsSignales.size} dossier(s) signalé(s), dernier à la place ${dernierSignale + 1}`);
} else {
  console.log('  INFO tri=signalement : aucun signalement ouvert — contrôle sans objet');
}

/* — Un tri inconnu ne doit rien casser — */
const inconnu = await get('/dossiers?tri=inconnu', token);
check('tri inconnu : 200 (repli sur le tri par défaut)', inconnu.status === 200);
check('tri inconnu : aucun dossier perdu', (inconnu.data || []).length === dossiers.length);

/* — La boîte de travail accepte le même tri — */
const boite = await get('/dashboard/boite-travail?tri=statut', token);
check('boîte de travail : 200 avec un tri', boite.status === 200);
const files = ['a_traiter_par_moi', 'en_attente_validation', 'incomplets', 'clotures_recents'];
const filesOrdonnees = files.every((cle) => {
  const liste = boite.data?.[cle]?.dossiers || [];
  return monotoneNombre(liste.map((d) => RANG.get(d.statut_code) ?? 99));
});
check('boîte de travail : les files suivent le tri demandé', filesOrdonnees);
check('boîte de travail : les compteurs restent présents',
  files.every((cle) => typeof boite.data?.[cle]?.total === 'number'));

const boiteParDefaut = await get('/dashboard/boite-travail', token);
check('boîte de travail : 200 sans tri', boiteParDefaut.status === 200);

/* — La boîte de travail trie aussi par niveau — */
const boiteNiveau = await get('/dashboard/boite-travail?tri=niveau', token);
check('boîte de travail : 200 avec tri=niveau', boiteNiveau.status === 200);
check('boîte de travail : les files suivent le niveau décroissant',
  files.every((cle) => {
    const liste = boiteNiveau.data?.[cle]?.dossiers || [];
    return monotoneNombre(liste.map((d) => Number(d.priorite_niveau) || 0), 'desc');
  }));

console.log(`\nRésultat : ${ok} vérification(s) réussie(s), ${ko} échec(s).`);
process.exit(ko === 0 ? 0 : 1);

import db from '../config/db.js';

/**
 * Référentiel des fonctionnalités du service.
 *
 * Chaque ligne du document source est enregistrée avec son état RÉEL, mesuré et
 * non déclaré. Un écran qui affiche « 325 fonctionnalités » sans dire combien
 * sont utilisables ne sert à rien : c'est le nombre de fonctions INERTES — dont
 * la permission existe mais qui ne mènent nulle part — qui induit en erreur.
 *
 * La nature distingue ce que c'est :
 *   METIER        une action qu'un agent accomplit ;
 *   INSTITUTIONNEL une information du service ;
 *   STRUCTURE     une ligne d'organigramme, sans action ;
 *   INTEGRATION   un report vers un système externe, préparé et tracé.
 */

/* ------------------------------------------------------------------ */
/* Données de référence pour les formulaires                             */
/* ------------------------------------------------------------------ */

/**
 * Ces six requirstours existaient avant le référentiel des 325
 * fonctionnalités, et six écrans en dépendent : formulaire de dossier, de
 * document, de courrier, d'agent, page des archives, page des immatriculations.
 *
 * Elles avaient été écrasées quand ce modèle a été écrit, sans que rien ne le
 * signale : un import manquant ne casse pas le serveur, il ne casse que
 * l'écran, à l'ouverture, et le message affiché est un 404 sur `/referentiel`.
 * Elles sont donc restaurées ici, et la règle s'applique : écrire un fichier
 * exige de vérifier ce qu'il remplace.
 */
export async function getTypesDossiers() {
  return db.query(
    `SELECT id, code, libelle, description, actif
     FROM types_dossiers ORDER BY id`
  );
}

export async function getPriorites() {
  return db.query(
    'SELECT id, libelle, niveau FROM priorites ORDER BY niveau DESC'
  );
}

export async function getFonctions() {
  return db.query(
    'SELECT id, libelle, description FROM fonctions ORDER BY libelle'
  );
}

export async function getTypesCourriers() {
  return db.query(
    'SELECT id, libelle FROM types_courriers ORDER BY libelle'
  );
}

export async function getTypesDocuments() {
  return db.query(
    `SELECT id, libelle, extensions_autorisees, taille_max
     FROM types_documents ORDER BY libelle`
  );
}

export async function getStatuts() {
  return db.query(
    'SELECT id, code, libelle, ordre FROM statuts_dossiers ORDER BY ordre'
  );
}

/* ------------------------------------------------------------------ */
/* Fonctions                                                           */
/* ------------------------------------------------------------------ */

/**
 * Liste des fonctions, filtrée.
 *
 * Le compte par état est renvoyé AVEC la liste, jamais calculé par l'écran :
 * un total recompté en JavaScript à partir d'une page tronquée donne un
 * résultat faux, et c'est précisément le chiffre qu'on cherche à vérifier.
 */
export async function lister(filtres = {}) {
  const where = [];
  const params = [];

  if (filtres.etat) { where.push('f.etat = ?'); params.push(filtres.etat); }
  if (filtres.nature) { where.push('f.nature = ?'); params.push(filtres.nature); }
  if (filtres.poste_code) { where.push('f.poste_code = ?'); params.push(filtres.poste_code); }
  if (filtres.section) { where.push('f.section_source = ?'); params.push(filtres.section); }
  /* Le document est un filtre à part entière, et non un détail : « fonction 118 »
     du référentiel de l'historique et « fonction 118 » des fonctionnalités
     obligatoires ne désignent pas la même chose. Sans ce filtre, l'écran
     présenterait les deux sous le même numéro. */
  if (filtres.document) { where.push('f.document = ?'); params.push(filtres.document); }

  /* Le filtre « non livrée » est celui qu'un chef de division consultera en
     premier : il cherche ce qui manque, pas ce qui existe. */
  if (filtres.manquantes === '1' || filtres.manquantes === true) {
    where.push("f.etat <> 'LIVREE'");
  }

  const lignes = await db.query(
    `SELECT f.*, p.libelle AS poste_libelle, p.role_nom
     FROM referentiel_fonctionnalites f
     LEFT JOIN referentiel_postes p ON p.code = f.poste_code
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY f.numero_source`,
    params
  );

  return { lignes, total: lignes.length, document: filtres.document || null };
}

/**
 * Bilan global.
 *
 * Les 325 lignes sont réparties par état ET par nature. Sans cette
 * distinction, le total mélangerait 184 actions réellement possibles et 41 lignes
 * d'organigramme qu'aucun agent n'accomplira jamais.
 */
export async function bilan(filtres = {}) {
  /* Le bilan porte sur UN document. Mélanger les deux donnerait un total de 514
     lignes dont personne ne peut dire combien correspondent à une exigence : c'est
     le défaut classique d'un cumul. */
  const parDocument = filtres.document || 'OBLIGATOIRE';
  const etq = 'WHERE document = ?';
  const parEtat = await db.query(
    `SELECT etat, COUNT(*) AS n FROM referentiel_fonctionnalites ${etq} GROUP BY etat`,
    [parDocument]
  );
  const parNature = await db.query(
    `SELECT nature, COUNT(*) AS n FROM referentiel_fonctionnalites ${etq} GROUP BY nature`,
    [parDocument]
  );
  const parPoste = await db.query(
    `SELECT f.poste_code, p.libelle AS poste_libelle, p.role_nom,
            COUNT(*) AS total,
            SUM(f.etat = 'LIVREE') AS livrees,
            SUM(f.etat = 'PARTIELLE') AS partielles,
            SUM(f.etat = 'INERTE') AS inertes,
            SUM(f.etat = 'NON_CONSTRUITE') AS non_construites,
            SUM(f.etat = 'HORS_PLATEFORME') AS hors_plateforme
     FROM referentiel_fonctionnalites f
     LEFT JOIN referentiel_postes p ON p.code = f.poste_code
     WHERE f.document = ?
     GROUP BY f.poste_code, p.libelle, p.role_nom
     ORDER BY p.niveau, p.libelle`,
    [parDocument]
  );

  const total = parEtat.reduce((s, r) => s + Number(r.n), 0);
  const compte = (etat) => Number(parEtat.find((r) => r.etat === etat)?.n || 0);

  /* Une fonction non livrée sans motif ne peut pas être corrigée plus tard,
     seulement constatée. Le décompte est donc vérifié ici et remonté tel quel. */
  const [sansMotif] = await db.query(
    `SELECT COUNT(*) AS n FROM referentiel_fonctionnalites
     WHERE document = ? AND etat <> 'LIVREE' AND (motif IS NULL OR motif = '')`,
    [parDocument]
  );

  const documents = await db.query(
    'SELECT document, COUNT(*) AS n FROM referentiel_fonctionnalites GROUP BY document ORDER BY document'
  );

  return {
    document: parDocument,
    documents: Object.fromEntries(documents.map((d) => [d.document, Number(d.n)])),
    total,
    par_etat: {
      livree: compte('LIVREE'),
      partielle: compte('PARTIELLE'),
      inerte: compte('INERTE'),
      non_construite: compte('NON_CONSTRUITE'),
      hors_plateforme: compte('HORS_PLATEFORME'),
    },
    par_nature: Object.fromEntries(parNature.map((r) => [r.nature, Number(r.n)])),
    par_poste: parPoste,
    /* Ce que le service peut réellement utiliser aujourd'hui, hors structures
       d'organigramme : c'est le seul chiffre qui décrit une capacité. */
    utilisables: compte('LIVREE'),
    /* Les fonctions dont la permission existe mais qui ne mènent nulle part.
       C'est la catégorie la plus trompeuse : elle a l'air livrée. */
    a_resoudre_en_priorite: compte('INERTE'),
    fonctions_non_livrees_sans_motif: Number(sansMotif?.n || 0),
  };
}

/* ------------------------------------------------------------------ */
/* Postes                                                              */
/* ------------------------------------------------------------------ */

export async function listerPostes() {
  return db.query(
    `SELECT p.*,
            (SELECT COUNT(*) FROM referentiel_fonctionnalites f
             WHERE f.poste_code = p.code) AS nb_fonctions,
            (SELECT COUNT(*) FROM referentiel_fonctionnalites f
             WHERE f.poste_code = p.code AND f.etat = 'LIVREE') AS nb_livrees
     FROM referentiel_postes p
     ORDER BY p.niveau, p.libelle`
  );
}

/* ------------------------------------------------------------------ */
/* Identité institutionnelle du service                                */
/* ------------------------------------------------------------------ */

/**
 * Informations institutionnelles.
 *
 * Ces données vivaient en dur dans la page de connexion, où elles n'étaient ni
 * traduisibles, ni vérifiables, ni modifiables. Une coordonnée téléphonique
 * écrite dans du JSX devient fausse au premier changement, et personne ne sait
 * qu'elle l'est.
 */
export async function infosService() {
  const lignes = await db.query(
    'SELECT cle, libelle, valeur, categorie, ordre FROM referentiel_service ORDER BY categorie, ordre'
  );
  const parCategorie = {};
  for (const l of lignes) {
    if (!parCategorie[l.categorie]) parCategorie[l.categorie] = [];
    parCategorie[l.categorie].push({ cle: l.cle, libelle: l.libelle, valeur: l.valeur });
  }
  return { donnees: lignes, par_categorie: parCategorie };
}

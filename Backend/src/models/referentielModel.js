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

  return { lignes, total: lignes.length };
}

/**
 * Bilan global.
 *
 * Les 325 lignes sont réparties par état ET par nature. Sans cette
 * distinction, le total mélangerait 184 actions réellement possibles et 41 lignes
 * d'organigramme qu'aucun agent n'accomplira jamais.
 */
export async function bilan() {
  const parEtat = await db.query(
    'SELECT etat, COUNT(*) AS n FROM referentiel_fonctionnalites GROUP BY etat'
  );
  const parNature = await db.query(
    'SELECT nature, COUNT(*) AS n FROM referentiel_fonctionnalites GROUP BY nature'
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
     GROUP BY f.poste_code, p.libelle, p.role_nom
     ORDER BY p.niveau, p.libelle`
  );

  const total = parEtat.reduce((s, r) => s + Number(r.n), 0);
  const compte = (etat) => Number(parEtat.find((r) => r.etat === etat)?.n || 0);

  /* Une fonction non livrée sans motif ne peut pas être corrigée plus tard,
     seulement constatée. Le décompte est donc vérifié ici et remonté tel quel. */
  const [sansMotif] = await db.query(
    `SELECT COUNT(*) AS n FROM referentiel_fonctionnalites
     WHERE etat <> 'LIVREE' AND (motif IS NULL OR motif = '')`
  );

  return {
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

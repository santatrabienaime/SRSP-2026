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

/**
 * Sous-types de dossiers actifs (types d'acte configurables).
 *
 * Les formulaires en ont besoin au même titre que les types de dossiers : le
 * type d'acte VISA n'est pas une liste figée dans le code, il se règle dans le
 * référentiel. Les renvoyer avec les autres données de référence évite un
 * second appel et garantit que les deux listes viennent de la même source.
 */
export async function getSousTypes() {
  return db.query(
    `SELECT st.id, st.type_dossier_id, st.code, st.libelle, st.actif, st.ordre,
            t.code AS type_code
     FROM sous_types_dossiers st
     JOIN types_dossiers t ON t.id = st.type_dossier_id
     WHERE st.actif = 1
     ORDER BY t.libelle, st.ordre, st.libelle`
  );
}

/** Pièces requises actives, avec leur portée type / sous-type. */
export async function getTypesPieces() {
  return db.query(
    `SELECT tp.id, tp.code, tp.libelle, tp.obligatoire, tp.actif, tp.phase,
            tp.ordre, tp.division_code, tp.type_dossier_id, tp.sous_type_id
     FROM types_pieces tp
     WHERE tp.actif = 1
     ORDER BY tp.division_code, tp.phase, tp.ordre, tp.libelle`
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

/**
 * Bilan global.
 *
 * Les 325 lignes sont réparties par état ET par nature. Sans cette
 * distinction, le total mélangerait 184 actions réellement possibles et 41 lignes
 * d'organigramme qu'aucun agent n'accomplira jamais.

/* ------------------------------------------------------------------ */
/* Postes                                                              */
/* ------------------------------------------------------------------ */


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

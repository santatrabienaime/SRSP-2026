import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';
import * as agentModel from '../models/agentModel.js';
import * as userModel from '../models/userModel.js';
import * as userService from './userService.js';
import { matriculeValide, MATRICULE_LONGUEUR_MIN, MATRICULE_LONGUEUR_MAX } from '../validators/dossierValidators.js';
import { motDePasseFort } from '../validators/authValidators.js';

/**
 * Personnel : la fiche d'une personne (`agents`) et, si elle en a un, son
 * compte de connexion (`users`).
 *
 * Les deux moitiés étaient gérées par deux écrans qui ne se parlaient pas :
 * l'écran « Agents » créait des fiches, l'écran « Utilisateurs » des comptes,
 * et rien n'empêchait un compte de recevoir une seconde fiche ni une fiche
 * d'être rattachée à un compte déjà pris. Ici, les deux sont écrites ensemble et
 * les règles sont vérifiées une seule fois, pour les deux.
 *
 * Règles portées par ce module (les schémas Joi ne vérifient que la forme) :
 *  - un matricule fait 2 à 10 caractères alphanumériques et n'est attribué
 *    qu'à une seule personne ;
 *  - un identifiant et un email de connexion ne servent qu'à un compte ;
 *  - un compte ne porte qu'une fiche : c'est ce qui donne à la personne sa
 *    division, sa fonction et sa place dans le journal d'audit ;
 *  - un mot de passe respecte la politique du service.
 */

const MESSAGE_MATRICULE =
  `Le matricule doit comporter ${MATRICULE_LONGUEUR_MIN} à ${MATRICULE_LONGUEUR_MAX} ` +
  'caractères, lettres et chiffres.';

/** Une valeur vide de formulaire vaut « non renseigné », pas « zéro ». */
const valeur = (v) => (v === '' || v === undefined ? null : v);

/**
 * Champs de la fiche, normalisés.
 *
 * `partiel` distingue la modification : un champ absent du formulaire ne doit
 * pas être écrit, sinon une mise à jour partielle effacerait le reste.
 */
function normaliserFiche(data, { partiel = false } = {}) {
  const fiche = {};
  const poser = (champ, transformee) => {
    if (partiel && data[champ] === undefined) return;
    fiche[champ] = transformee === undefined ? valeur(data[champ]) : transformee;
  };

  poser('nom', data.nom === undefined ? undefined : String(data.nom).trim());
  poser('prenom', data.prenom === undefined ? undefined : String(data.prenom).trim());
  /* Le matricule est enregistré tel qu'il a été saisi, en majuscules : le
     service écrit « SRSP-005 » et un numéro sans séparateur, et c'est cette
     forme que l'agent reconnaît. La règle des 2 à 10 caractères se juge, elle,
     sur la forme compacte (voir `matriculeValide`). */
  poser(
    'matricule',
    data.matricule === undefined
      ? undefined
      : String(data.matricule).trim().toUpperCase() || null
  );
  poser('fonction_id', data.fonction_id === undefined ? undefined : Number(valeur(data.fonction_id)) || null);
  poser('division_id', data.division_id === undefined ? undefined : Number(valeur(data.division_id)) || null);
  poser('email', data.email === undefined ? undefined : String(data.email ?? '').trim() || null);
  poser('telephone', data.telephone === undefined ? undefined : String(data.telephone ?? '').trim() || null);
  /* `actif` n'est écrit que s'il est fourni : une création sans ce champ doit
     donner une personne active (la valeur par défaut de la base), pas une
     personne désactivée par un `null` de passage. */
  if (data.actif !== undefined) fiche.actif = data.actif ? 1 : 0;

  return fiche;
}

async function verifierExistence(table, id, message) {
  if (id === null || id === undefined) return;
  const rows = await db.query(`SELECT id FROM ${table} WHERE id = ? LIMIT 1`, [id]);
  if (!rows[0]) throw httpError(422, message);
}

/** Contrôles de la fiche : matricule et rattachements. */
async function verifierFiche(fiche, saufId = null) {
  if (fiche.nom !== undefined && !fiche.nom) throw httpError(422, 'Le nom est obligatoire.');
  if (fiche.prenom !== undefined && !fiche.prenom) throw httpError(422, 'Le prénom est obligatoire.');

  if (fiche.matricule !== undefined && fiche.matricule !== null) {
    if (!matriculeValide(fiche.matricule)) throw httpError(422, MESSAGE_MATRICULE);
    const detenteur = await agentModel.matriculePris(fiche.matricule, saufId);
    if (detenteur) {
      throw httpError(
        409,
        `Le matricule ${fiche.matricule} est déjà attribué à ${detenteur.nom} ${detenteur.prenom}.`
      );
    }
  }

  await verifierExistence('divisions', fiche.division_id, 'Division inconnue.');
  await verifierExistence('fonctions', fiche.fonction_id, 'Fonction inconnue.');
}

async function verifierRole(roleId) {
  if (!roleId) throw httpError(422, 'Le rôle de connexion est obligatoire.');
  const rows = await db.query('SELECT id FROM roles WHERE id = ? LIMIT 1', [roleId]);
  if (!rows[0]) throw httpError(422, 'Rôle inconnu.');
}

/**
 * Crée le compte de connexion après avoir vérifié tout ce qui peut l'être.
 *
 * Les contraintes d'unicité existent en base, mais leur message ne dit pas
 * *qui* détient déjà l'identifiant : l'administrateur doit pouvoir trancher, il
 * lui faut donc la réponse, pas un code d'erreur SQL.
 */
async function creerCompte(data) {
  const username = String(data.username ?? '').trim();
  const email = String(data.compte_email ?? '').trim();

  if (username.length < 3) throw httpError(422, "L'identifiant de connexion doit comporter au moins 3 caractères.");
  if (!email) throw httpError(422, "L'email de connexion est obligatoire.");
  if (!data.password) throw httpError(422, 'Le mot de passe est obligatoire.');

  const { error } = motDePasseFort.validate(data.password);
  if (error) throw httpError(422, error.details[0].message);

  const roleId = Number(valeur(data.role_id)) || null;
  await verifierRole(roleId);

  const memeIdentifiant = await userModel.findByUsername(username);
  if (memeIdentifiant) throw httpError(409, `L'identifiant « ${username} » est déjà utilisé.`);

  const memeEmail = await userModel.findByEmail(email);
  if (memeEmail) throw httpError(409, `L'email « ${email} » est déjà utilisé par le compte ${memeEmail.username}.`);

  const compte = await userService.create({ username, email, password: data.password, role_id: roleId });
  return compte.id;
}

/** Met à jour le compte existant, sans effacer ce que le formulaire ne porte pas. */
async function majCompte(userId, data) {
  const compte = await userModel.findById(userId);
  if (!compte) return;

  let email = compte.email;
  if (data.compte_email !== undefined) {
    email = String(data.compte_email ?? '').trim();
    if (!email) throw httpError(422, "L'email de connexion est obligatoire.");
    const detenteur = await userModel.findByEmail(email);
    if (detenteur && detenteur.id !== Number(userId)) {
      throw httpError(409, `L'email « ${email} » est déjà utilisé par le compte ${detenteur.username}.`);
    }
  }

  let roleId = compte.role_id;
  if (data.role_id !== undefined) {
    roleId = Number(valeur(data.role_id)) || null;
    await verifierRole(roleId);
  }

  const actif = data.compte_actif === undefined ? compte.actif : (data.compte_actif ? 1 : 0);

  await userModel.updateUser(userId, { email, role_id: roleId, actif });
}

/** Retourne la personne complète : l'écran met la ligne à jour sans recharger. */
const personne = (id) => agentModel.findAvecCompte(id);

export async function list() {
  return agentModel.findAll();
}

export async function getOne(id) {
  const fiche = await personne(id);
  if (!fiche) throw httpError(404, 'Personne introuvable.');
  return fiche;
}

export async function create(data) {
  const fiche = normaliserFiche(data);
  await verifierFiche(fiche);

  let compteId = null;
  if (data.creer_compte) compteId = await creerCompte(data);

  // L'email de contact reprend celui du compte quand il n'est pas saisi : une
  // seule adresse à connaître, donc pas de divergence silencieuse entre les
  // deux colonnes qui portent l'email de la personne.
  if (!fiche.email && data.creer_compte) fiche.email = String(data.compte_email).trim();

  try {
    const { id } = await agentModel.create({ ...fiche, user_id: compteId });
    return await personne(id);
  } catch (err) {
    // La fiche n'a pas été créée : le compte seul ne servirait à rien et
    // laisserait un identifiant pris sans personne derrière.
    if (compteId) await userService.remove(compteId).catch(() => {});
    throw err;
  }
}

export async function update(id, data) {
  const courante = await agentModel.findById(id);
  if (!courante) throw httpError(404, 'Personne introuvable.');

  const fiche = normaliserFiche(data, { partiel: true });
  await verifierFiche(fiche, id);

  // Le compte lié, s'il existe : créé ici ou déjà rattaché à la fiche.
  let compteId = courante.user_id || null;

  if (compteId) {
    await majCompte(compteId, data);
    // Le contact suit l'email du compte s'il a été laissé vide.
    const compte = await userModel.findById(compteId);
    if (fiche.email === null && compte) fiche.email = compte.email;
  } else if (data.creer_compte) {
    compteId = await creerCompte(data);
    await agentModel.setUserId(id, compteId);
    if (fiche.email === null) fiche.email = String(data.compte_email).trim();
  }

  /* Rattachement à un compte existant : l'API historique des fiches
     (`PUT /api/agents/:id`) envoie `user_id`. Un compte ne doit pas pour autant
     recevoir une seconde fiche, et une fiche qui a déjà son compte n'en change
     pas par ce chemin : le lien se défait par la gestion du personnel, où l'on
     voit les deux moitiés de la personne. */
  if (data.user_id !== undefined && !compteId) {
    const cible = Number(valeur(data.user_id)) || null;
    if (cible) {
      const dejaRattachees = await agentModel.findByUserId(cible);
      if (dejaRattachees.some((f) => f.id !== Number(id))) {
        throw httpError(409, 'Ce compte est déjà rattaché à une autre personne.');
      }
      const compte = await userModel.findById(cible);
      if (!compte) throw httpError(422, 'Compte de connexion inconnu.');
      await agentModel.setUserId(id, cible);
    }
  }

  await agentModel.update(id, fiche);
  return personne(id);
}

/**
 * Supprime une personne : sa fiche, puis son compte de connexion.
 *
 * Une fiche citée par un dossier, un traitement ou une vérification ne peut pas
 * disparaître sans trouer l'historique : elle est alors désactivée, comme un
 * compte référencé par le journal.
 */
export async function remove(id) {
  const fiche = await agentModel.findById(id);
  if (!fiche) throw httpError(404, 'Personne introuvable.');

  let message = 'Personne supprimée.';
  try {
    await agentModel.remove(id);
  } catch (e) {
    if (e.code === '23503') {
      await agentModel.setActif(id, false);
      return { message: 'Personne citée par des dossiers : fiche désactivée plutôt que supprimée.' };
    }
    throw e;
  }

  if (fiche.user_id) {
    const apurement = await userService.remove(fiche.user_id);
    if (apurement?.message?.includes('désactivé')) {
      message = 'Fiche supprimée ; le compte de connexion, référencé, a été désactivé.';
    }
  }

  return { message };
}

/**
 * Active ou désactive la personne : sa fiche et son compte.
 *
 * Séparer les deux laisserait un compte capable de se connecter à une fiche
 * désactivée — le cas exact qui fait douter de ce qu'on lit à l'écran.
 * L'activation du compte seul reste possible par le formulaire (`compte_actif`).
 */
export async function toggleFiche(id) {
  const fiche = await agentModel.findById(id);
  if (!fiche) throw httpError(404, 'Personne introuvable.');

  const actif = !fiche.actif;
  await agentModel.setActif(id, actif);
  if (fiche.user_id) await userModel.setActif(fiche.user_id, actif);

  return personne(id);
}

export async function resetPassword(id, password) {
  const fiche = await agentModel.findById(id);
  if (!fiche) throw httpError(404, 'Personne introuvable.');
  if (!fiche.user_id) throw httpError(422, 'Cette personne n’a pas de compte de connexion.');
  await userService.resetPassword(fiche.user_id, password);
  return { message: 'Mot de passe réinitialisé.' };
}

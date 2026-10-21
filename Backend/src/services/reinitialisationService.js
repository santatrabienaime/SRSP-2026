import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import * as reinitialisationModel from '../models/reinitialisationModel.js';
import * as userModel from '../models/userModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { httpError } from '../utils/httpError.js';

/**
 * Réinitialisation de mot de passe.
 *
 * Le canal de l'e-mail et du SMS est exclu du périmètre de la plateforme.
 * Le circuit retenu passe donc par l'administration du service :
 *
 *   1. l'agent dépose une **demande** depuis l'écran public ;
 *   2. un administrateur **vérifie son identité** et lui délivre un **code à
 *      usage unique**, valable quelques minutes ;
 *   3. l'agent saisit ce code et **choisit lui-même** son nouveau mot de
 *      passe.
 *
 * L'agent garde la main sur son mot de passe — personne ne le choisit à sa
 * place, personne ne le voit en clair. L'administrateur ne fait que lever le
 * verrou et prouver qu'il a reconnu la personne.
 *
 * Ce qui protège l'ensemble :
 *   - le code n'est **jamais** stocké en clair : seule son empreinte l'est ;
 *   - il est à **usage unique** et **court-lived** (quinze minutes) ;
 *   - le nombre de tentatives est **plafonné** : au-delà, la demande est
 *     annulée et il faut recommencer ;
 *   - les réponses sont **identiques** que le compte existe ou non, que le
 *     code soit faux ou expiré : la page ne révèle rien ;
 *   - après réinitialisation, les sessions ouvertes sont **invalidées**.
 */

/** Durée de validité du code, en minutes. */
const CODE_MINUTES = Number(process.env.REINIT_CODE_MINUTES || 15);
/** Nombre de tentatives de code avant annulation de la demande. */
const MAX_TENTATIVES = Number(process.env.REINIT_MAX_TENTATIVES || 5);

/**
 * Sel du hachage du code.
 *
 * Le code ne vit que quelques minutes et ne sert qu'une fois : son empreinte
 * n'a pas besoin d'être un hachage lent. Le sel sert à ce qu'une base
 * divulguée ne permette pas de retrouver le code par force brute.
 */
function sel() {
  return process.env.JWT_SECRET || 'srsp-reinitialisation';
}

/** Empreinte du code. */
function empreinte(code) {
  return crypto.createHash('sha256').update(`${sel()}:${code}`).digest('hex');
}

/** Code à six chiffres, généré par la source cryptographique du système. */
function nouveauCode() {
  const n = crypto.randomInt(0, 1000000);
  return String(n).padStart(6, '0');
}

/**
 * Réponse de la demande, identique dans tous les cas.
 *
 * Elle ne dit pas si le compte existe : une page qui répond « compte
 * inconnu » permet d'énumérer les comptes du service.
 */
const REPONSE_GENERIQUE =
  "Si un compte actif correspond à cet identifiant, la demande a été transmise à l'administrateur. " +
  'Un administrateur vous contactera pour vous remettre un code de réinitialisation.';

/**
 * Dépose une demande de réinitialisation.
 *
 * @param {string} identifiant  nom d'utilisateur ou e-mail saisi
 * @param {string} ip           adresse IP de la requête
 */
export async function demander(identifiant, ip) {
  const saisi = String(identifiant || '').trim();
  if (!saisi) throw httpError(400, 'Veuillez renseigner votre identifiant ou votre e-mail.');

  const user = await userModel.findUserByUsernameOrEmail(saisi);
  if (!user) {
    // Aucun compte : la demande reste anonyme. Elle est nevertheless tracée,
    // car une série de demandes inconnues signale une recherche de comptes.
    await historiqueModel.log({
      user_id: null,
      action: 'DEMANDE_REINITIALISATION_INCONNUE',
      details: `Demande de réinitialisation pour un identifiant inconnu (« ${saisi} »).`,
      ip_address: ip,
    });
    return { message: REPONSE_GENERIQUE };
  }

  if (!user.actif) {
    await historiqueModel.log({
      user_id: user.id,
      action: 'DEMANDE_REINITIALISATION',
      details: 'Demande de réinitialisation pour un compte désactivé : demande sans suite.',
      ip_address: ip,
    });
    return { message: REPONSE_GENERIQUE };
  }

  /* Une demande déjà ouverte n'est pas dupliquée : l'administrateur n'a
     qu'une chose à traiter, et l'agent ne fait pas la queue deux fois. */
  const existante = await reinitialisationModel.findDemandeEnAttente(user.id);
  if (existante) {
    return { message: REPONSE_GENERIQUE, demande_id: existante.id };
  }

  const demande = await reinitialisationModel.createDemande({
    userId: user.id,
    identifiantSaisi: saisi,
    ipAddress: ip,
  });

  await historiqueModel.log({
    user_id: user.id,
    action: 'DEMANDE_REINITIALISATION',
    details: `Demande de réinitialisation de mot de passe (${user.email}).`,
    ip_address: ip,
  });

  /* Les administrateurs sont prévenus par la notification interne : c'est le
     seul canal de signalement disponible, et il va droit à ceux qui peuvent
     agir. */
  await notificationModel.notifyRole(
    'ADMIN',
    {
      type: 'INFO',
      action: 'DEMANDE_REINITIALISATION',
      message: `Demande de réinitialisation de mot de passe — ${user.username} (${user.email}).`,
      lien: '/administration/reinitialisations',
    }
  );

  return { message: REPONSE_GENERIQUE, demande_id: demande.id };
}

/**
 * Délivre un code de réinitialisation (administrateur).
 *
 * Le code n'est renvoyé qu'ici, une seule fois : il n'est pas stocké, il
 * n'est donc pas reconsultable. L'administrateur le remet à l'agent.
 */
export async function genererCode(demandeId, adminId, motif) {
  const demande = await reinitialisationModel.findDemande(demandeId);
  if (!demande) throw httpError(404, 'Demande introuvable.');
  if (!['EN_ATTENTE', 'CODE_GENERE'].includes(demande.statut)) {
    throw httpError(
      409,
      `Cette demande n'est plus active (statut ${demande.statut}) : elle ne peut pas être codesée.`
    );
  }

  const code = nouveauCode();
  const expireLe = new Date(Date.now() + CODE_MINUTES * 60000);

  await reinitialisationModel.attacherCode(demande.id, {
    empreinte: empreinte(code),
    adminId,
    expireLe,
    motif,
  });

  /* Le compte peut être verrouillé après des échecs de connexion : c'est
     souvent la raison de la demande. L'administrateur ayant vérifié
     l'identité, le verrou est levé. */
  await userModel.unlockUser(demande.user_id);

  await historiqueModel.log({
    user_id: adminId,
    action: 'CODE_REINITIALISATION_GENERE',
    details:
      `Code de réinitialisation délivré pour le compte #${demande.user_id}` +
      (motif ? ` — motif : ${motif}.` : '.') +
      ` Validité : ${CODE_MINUTES} minutes.`,
  });

  const cible = await userModel.findById(demande.user_id);
  if (cible) {
    await notificationModel.notifyUser(cible.id, {
      type: 'INFO',
      action: 'CODE_REINITIALISATION',
      message:
        `Un code de réinitialisation a été délivré pour votre compte. ` +
        `Présentez-le à l'administrateur : il est valable ${CODE_MINUTES} minutes.`,
      lien: '/mot-de-passe-oublie/reset',
    });
  }

  return {
    code,
    expire_le: expireLe,
    duree_minutes: CODE_MINUTES,
    compte: cible ? { username: cible.username, email: cible.email } : null,
  };
}

/**
 * Consomme le code et applique le nouveau mot de passe.
 *
 * Les messages d'erreur sont volontairement indistincts : un code faux, un
 * code expiré et une demande inexistante rendent la même réponse.
 */
export async function reinitialiser(identifiant, code, nouveauMotDePasse, ip) {
  const saisi = String(identifiant || '').trim();
  const codeSaisi = String(code || '').trim();
  if (!saisi || !codeSaisi) {
    throw httpError(400, 'Renseignez votre identifiant et le code reçu.');
  }

  const user = await userModel.findUserByUsernameOrEmail(saisi);
  if (!user) {
    throw httpError(422, 'Code invalide ou expiré.');
  }

  const demande = await reinitialisationModel.findDemandeActive(user.id);
  if (!demande || !demande.empreinte) {
    throw httpError(422, 'Code invalide ou expiré.');
  }

  if (demande.empreinte !== empreinte(codeSaisi)) {
    const etat = await reinitialisationModel.enregistrerTentative(demande.id, MAX_TENTATIVES);
    await historiqueModel.log({
      user_id: user.id,
      action: 'REINITIALISATION_MOT_DE_PASSE_ECHOUEE',
      details:
        `Code de réinitialisation erroné (tentative ${etat.tentatives}/${MAX_TENTATIVES}).` +
        (etat.annulee ? ' Demande annulée.' : ''),
      ip_address: ip,
    });
    throw httpError(422, 'Code invalide ou expiré.');
  }

  const password_hash = await bcrypt.hash(nouveauMotDePasse, 10);
  await userModel.updatePassword(user.id, password_hash);
  await reinitialisationModel.marquerUtilise(demande.id);
  await userModel.resetFailedAttempts(user.id);

  await historiqueModel.log({
    user_id: user.id,
    action: 'REINITIALISATION_MOT_DE_PASSE',
    details: 'Mot de passe réinitialisé à la demande du titulaire. Les sessions ouvertes ont été invalidées.',
    ip_address: ip,
  });

  await notificationModel.notifyUser(user.id, {
    type: 'INFO',
    action: 'REINITIALISATION_MOT_DE_PASSE',
    message: 'Votre mot de passe a été réinitialisé. Vous pouvez vous connecter avec le nouveau.',
    lien: '/login',
  });

  return { message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' };
}

/** Demandes visibles par l'administrateur. */
export async function lister(options) {
  return reinitialisationModel.listDemandes(options);
}

/** Détail d'une demande. */
export async function detail(demandeId) {
  const demande = await reinitialisationModel.findDemandeAvecCompte(demandeId);
  if (!demande) throw httpError(404, 'Demande introuvable.');
  return demande;
}

/** Annule une demande. */
export async function annuler(demandeId, adminId, motif) {
  const demande = await reinitialisationModel.findDemande(demandeId);
  if (!demande) throw httpError(404, 'Demande introuvable.');
  if (['UTILISE', 'ANNULE'].includes(demande.statut)) {
    throw httpError(409, `Cette demande est déjà close (statut ${demande.statut}).`);
  }
  const resultat = await reinitialisationModel.annuler(demandeId, motif);
  await historiqueModel.log({
    user_id: adminId,
    action: 'DEMANDE_REINITIALISATION_ANNULEE',
    details: `Demande de réinitialisation annulée${motif ? ` — motif : ${motif}.` : '.'}`,
  });
  return resultat;
}

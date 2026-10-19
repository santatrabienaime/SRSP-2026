/**
 * Règles de saisie du formulaire de création d'un dossier.
 *
 * Isolé dans un module pur, sans React : la logique était auparavant imbriquée
 * dans le composant, donc invérifiable — un défaut de validation ne se voyait
 * qu'à l'écran, en bloquant un agent devant sa saisie.
 *
 * Chaque règle produit soit une ERREUR (qui bloque la continued), soit un
 * AVERTISSEMENT (qui est montré sans bloquer). La distinction n'est pas
 * cosmétique : une erreur trop sévère immobilise l'agent devant son poste.
 */

/** Longueur minimale et maximale du matricule, séparateurs exclus. */
export const MATRICULE_LONGUEUR_MIN = 2;
export const MATRICULE_LONGUEUR_MAX = 10;

/** Retire les séparateurs pour juger de la longueur réelle. */
export function compacterMatricule(valeur) {
  return String(valeur || '').replace(/[\s.-]/g, '').toUpperCase();
}

/**
 * Un matricule respecte-t-il la règle du service ?
 *
 * Le demandeur est identifié par son numéro de matricule : 2 à 10 caractères
 * alphanumériques. Le numéro est saisi tantôt avec espaces, tantôt sans : c'est
 * la forme compactée qui est jugée.
 *
 * Trop long n'est pas forcément faux : un dossier enregistré avant la règle
 * porte un numéro plus long, et le service l'accepte tant qu'il n'est pas
 * modifié. D'où un AVERTISSEMENT et non une erreur (voir `validerDossier`).
 */
export function matriculePlausible(valeur) {
  const compact = compacterMatricule(valeur);
  if (!compact) return true;
  if (compact.length < MATRICULE_LONGUEUR_MIN || compact.length > MATRICULE_LONGUEUR_MAX) return false;
  return /^[A-Z0-9]+$/.test(compact);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEPHONE = /^[+0-9\s.-]{6,30}$/;

/**
 * Contrôle une étape du formulaire.
 *
 * Retourne `{ erreurs, avertissements }` pour l'étape demandée. Les erreurs
 * bloquent le passage ou l'enregistrement ; les avertissements informent sans
 * empêcher de continuer.
 */
export function validerDossier(form, etape = 1) {
  const erreurs = [];
  const avertissements = [];

  const nom = (form.demandeur_nom || '').trim();
  const prenom = (form.demandeur_prenom || '').trim();
  const matricule = compacterMatricule(form.matricule);
  const objet = (form.objet || '').trim();
  const email = (form.demandeur_email || '').trim();
  const tel = (form.demandeur_tel || '').trim();
  const limite = form.date_limite || '';
  const reception = form.date_reception || '';

  /* Étape 1 — le type. Il détermine la division, donc rien ne se fait sans. */
  if (!form.type_id) erreurs.push('Le type de dossier est requis.');

  /* Étape 2 — l'identité. Le nom seul suffit : le prénom entre dans le nom
     affiché, et exiger les deux immobiliserait pour un demandeur que l'agent
     ne connaît que par son nom de famille. L'absence du prénom est donc
     signalée sans bloquer. */
  if (!nom) {
    erreurs.push('Le nom du demandeur est requis.');
  } else if (!prenom) {
    avertissements.push('Prénom non renseigné.');
  }

  if (matricule && matricule.length < MATRICULE_LONGUEUR_MIN) {
    // Trop court : aucun numéro déjà enregistré ne l'est, donc rien ne peut le
    // justifier. C'est la seule longueur refusée d'emblée.
    erreurs.push(`Le matricule doit comporter au moins ${MATRICULE_LONGUEUR_MIN} caractères.`);
  } else if (matricule && !matriculePlausible(matricule)) {
    // Trop long : le numéro peut avoir été enregistré avant la règle et rester
    // acceptable. On avertit, on ne verrouille pas la saisie.
    avertissements.push(
      `Matricule « ${form.matricule} » : format inhabituel (${MATRICULE_LONGUEUR_MAX} caractères maximum). `
      + "S'il est déjà enregistré, il reste accepté tel quel."
    );
  }

  if (email && !EMAIL.test(email)) erreurs.push('Email invalide.');
  if (tel && !TELEPHONE.test(tel)) erreurs.push('Téléphone : uniquement chiffres, espaces et + . -');

  /* Étape 3 — l'objet et la priorité. L'objet est ce que l'agent verra dans
     toutes les listes : sans lui, le dossier n'est pas identifiable. */
  if (!objet) erreurs.push("L'objet est requis.");
  if (!form.priorite_id) erreurs.push('La priorité est requise.');
  if (!reception) erreurs.push('La date de réception est requise.');

  if (limite && reception && limite < reception) {
    erreurs.push('La date limite ne peut pas précéder la date de réception.');
  } else if (limite && reception) {
    const jours = Math.round((new Date(limite) - new Date(reception)) / 86400000);
    if (jours > 365) avertissements.push(`Échéance à ${jours} jours : vérifier qu'elle est réaliste.`);
  }

  // Filtre final sur l'étape : chaque étape ne montre que ses propres messages,
  // sinon l'agent verrait « objet requis » alors qu'il saisit encore son nom.
  const motifs = {
    1: [/type de dossier/i],
    2: [/nom du demandeur/i, /^prénom/i, /matricule/i, /^email/i, /^téléphone/i],
    3: [/objet/i, /priorité/i, /date de réception/i, /date limite/i, /échéance/i],
  }[etape] || [];

  const pertinent = (m) => motifs.some((r) => r.test(m));
  return {
    erreurs: erreurs.filter(pertinent),
    avertissements: avertissements.filter(pertinent),
  };
}

/** Un seul appel, pour l'ensemble du formulaire (bouton d'enregistrement). */
export function validerTout(form) {
  const toutes = [1, 2, 3].flatMap((e) => {
    const { erreurs, avertissements } = validerDossier(form, e);
    return [
      ...erreurs.map((m) => ({ type: 'erreur', message: m })),
      ...avertissements.map((m) => ({ type: 'avertissement', message: m })),
    ];
  });
  return {
    erreurs: toutes.filter((t) => t.type === 'erreur'),
    avertissements: toutes.filter((t) => t.type === 'avertissement'),
  };
}

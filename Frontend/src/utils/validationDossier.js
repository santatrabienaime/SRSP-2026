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

/** Longueur minimale et maximale d'un matricule, chiffres et tirets compris. */
const CIN_LONGUEUR_MIN = 5;
const CIN_LONGUEUR_MAX = 20;

/** Retire les séparateurs pour juger de la longueur réelle. */
export function compacterCIN(valeur) {
  return String(valeur || '').replace(/[\s.-]/g, '').toUpperCase();
}

/**
 * Un matricule est-ilutilisable ?
 *
 * L'administration malgache délivre des CIN de longueurs diverses — la base en
 * contient de 5, 6, 8 et 12 chiffres, et des cartes de non-inscription
 * alphanumériques. Imposer 12 chiffres exactement revenait à refuser une pièce
 * d'identité parfaitement officielle : le formulaire bloquait, et la
 * modification d'un dossier existant devenait impossible.
 *
 * On exige donc seulement que le matricule soit composed de caractères
 * d'identification plausibles. Un format atypique produit un avertissement,
 * jamais un refus.
 */
export function cinPlausible(valeur) {
  const compact = compacterCIN(valeur);
  if (!compact) return true;
  if (compact.length < CIN_LONGUEUR_MIN || compact.length > CIN_LONGUEUR_MAX) return false;
  return /^[A-Z0-9]+$/.test(compact);
}

/** Le matricule présente-t-il un format inhabituel, sans le rejeter ? */
export function cinAtypique(valeur) {
  const compact = compacterCIN(valeur);
  if (!compact || !cinPlausible(compact)) return false;
  // 12 chiffres, ou une lettre suivie de chiffres : les deux formats courants.
  if (/^\d{12}$/.test(compact)) return false;
  if (/^[A-Z]{1,4}\d{2,10}$/.test(compact)) return false;
  return true;
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
  const cin = compacterCIN(form.matricule);
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

  if (cin && !cinPlausible(cin)) {
    // Un matricule illisible se signale, il ne verrouille pas la saisie : c'est
    // à l'agent de décider, et le service refusera de le facturer autrement.
    avertissements.push(
      `Matricule « ${form.matricule} » : format inhabituel. Vérifiez la saisie avant de valider.`
    );
  } else if (cinAtypique(cin)) {
    avertissements.push(`Matricule « ${form.matricule} » : format atypique, accepté tel quel.`);
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

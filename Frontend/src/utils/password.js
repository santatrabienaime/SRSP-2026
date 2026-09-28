/**
 * Politique de mot de passe (article 1.6 du rapport explicatif) :
 * huit caracteres minimum, avec une majuscule, une minuscule, un chiffre
 * et un caractere special. Utilisee cote interface pour guider l'utilisateur
 * avant l'envoi ; le serveur applique la meme regle.
 */
export const PASSWORD_MESSAGE =
  'Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, ' +
  'une minuscule, un chiffre et un caractère spécial.';

export const passwordRules = [
  { label: 'Au moins 8 caractères', test: (v) => (v || '').length >= 8 },
  { label: 'Une majuscule', test: (v) => /[A-ZÀ-Þ]/.test(v || '') },
  { label: 'Une minuscule', test: (v) => /[a-zà-ÿ]/.test(v || '') },
  { label: 'Un chiffre', test: (v) => /[0-9]/.test(v || '') },
  { label: 'Un caractère spécial', test: (v) => /[^A-Za-z0-9]/.test(v || '') },
];

/** true si le mot de passe respecte toutes les règles. */
export function isStrongPassword(v) {
  return passwordRules.every((r) => r.test(v));
}

/** Liste des règles non respectées, pour l'affichage. */
export function failedPasswordRules(v) {
  return passwordRules.filter((r) => !r.test(v)).map((r) => r.label);
}

export default isStrongPassword;

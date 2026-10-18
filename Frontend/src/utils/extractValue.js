/**
 * Récupère une valeur numérique depuis une réponse serveur.
 * Gère le cas où la valeur est un objet { count: X } ou directement un nombre.
 */
export function extractValue(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'object' && val.count !== undefined) return val.count;
  return typeof val === 'number' ? val : parseInt(val, 10) || 0;
}
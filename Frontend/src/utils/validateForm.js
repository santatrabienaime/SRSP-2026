/**
 * Petites validations de formulaires, sans dépendance externe.
 */

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');

export const required = (value) =>
  value !== undefined && value !== null && String(value).trim() !== '';

export const minLength = (value, n) => String(value || '').length >= n;

export const isDateISO = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '');

/**
 * Valide un objet de valeurs selon un schéma simple :
 * { champ: { rules: [...], label: '…' } }
 * Retourne { errors: {champ: message}, valid: boolean }.
 */
export function validate(values, schema) {
  const errors = {};
  for (const [field, def] of Object.entries(schema)) {
    const value = values[field];
    const label = def.label || field;
    for (const rule of def.rules || []) {
      if (typeof rule === 'function') {
        const msg = rule(value, values);
        if (msg) { errors[field] = msg; break; }
      }
    }
    if (errors[field]) continue;
    if (def.custom) {
      const msg = def.custom(value, values);
      if (msg) errors[field] = msg;
    }
  }
  return { errors, valid: Object.keys(errors).length === 0 };
}

/** Règles usuelles réutilisables. */
export const rules = {
  required: (label) => (v) => (required(v) ? null : `${label} est requis.`),
  email: (label = 'Email') => (v) =>
    !v || isEmail(v) ? null : `${label} invalide.`,
  min: (n, label = 'Ce champ') => (v) =>
    minLength(v, n) ? null : `${label} doit contenir au moins ${n} caractères.`,
};
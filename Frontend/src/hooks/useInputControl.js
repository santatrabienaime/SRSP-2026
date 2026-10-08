/**
 * Contrôle de saisie automatique en temps réel — SRSP Fitovinany v2.0
 *
 * Principe fondamental : le caractère invalide est BLOQUÉ avant même
 * d'apparaître dans le champ (onKeyDown → preventDefault).
 *
 * Le hook est pur (pas de rendu) : il gère l'état, le formatage
 * automatique, le blocage clavier et la validation. Les composants
 * de champ (components/fields) l'habillent pour l'affichage.
 */
import { useState, useCallback, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   TYPES DE CHAMPS
   ═══════════════════════════════════════════════════════════════ */
export const INPUT_TYPES = {
  TEXT: 'text',
  UPPERCASE: 'uppercase',
  TITLECASE: 'titlecase',
  LOWERCASE: 'lowercase',
  CIN: 'cin',
  PHONE: 'phone',
  EMAIL: 'email',
  NUMBER: 'number',
  AMOUNT: 'amount',
  PASSWORD: 'password',
  TEXTAREA: 'textarea',
  REFERENCE: 'reference',
};

/* ═══════════════════════════════════════════════════════════════
   PATTERNS DE BLOCAGE (touche autorisée)
   ═══════════════════════════════════════════════════════════════ */
const KEY_PATTERNS = {
  [INPUT_TYPES.UPPERCASE]: /^[a-zA-ZÀ-ÿ\s'-]$/,
  [INPUT_TYPES.TITLECASE]: /^[a-zA-ZÀ-ÿ\s'-]$/,
  [INPUT_TYPES.LOWERCASE]: /^[a-z0-9@._-]$/,
  [INPUT_TYPES.CIN]: /^\d$/,
  [INPUT_TYPES.PHONE]: /^\d$/,
  [INPUT_TYPES.EMAIL]: /^[a-zA-Z0-9@._-]$/,
  [INPUT_TYPES.NUMBER]: /^\d$/,
  [INPUT_TYPES.AMOUNT]: /^\d$/,
  [INPUT_TYPES.REFERENCE]: /^[a-zA-Z0-9/_-]$/,
};

/* Types où l'espace est interdit (§10.3 du cahier des charges). */
const NO_SPACE_TYPES = new Set([
  INPUT_TYPES.EMAIL,
  INPUT_TYPES.PASSWORD,
  INPUT_TYPES.CIN,
  INPUT_TYPES.PHONE,
  INPUT_TYPES.NUMBER,
  INPUT_TYPES.AMOUNT,
  INPUT_TYPES.REFERENCE,
]);

/* ═══════════════════════════════════════════════════════════════
   TRANSFORMATIONS (formatage automatique)
   ═══════════════════════════════════════════════════════════════ */
const TRANSFORMERS = {
  [INPUT_TYPES.UPPERCASE]: (v) => v.toUpperCase().replace(/[^A-ZÀ-Ý\s'-]/g, ''),
  [INPUT_TYPES.TITLECASE]: (v) =>
    v.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '').replace(/\b\w/g, (c) => c.toUpperCase()),
  [INPUT_TYPES.LOWERCASE]: (v) => v.toLowerCase().replace(/[^a-z0-9@._-]/g, ''),
  [INPUT_TYPES.CIN]: (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 12);
    return digits
      .replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,3})/, (_, a, b, c, d) =>
        [a, b, c, d].filter(Boolean).join(' ')
      );
  },
  [INPUT_TYPES.PHONE]: (v) => {
    const d = v.replace(/\D/g, '').slice(0, 10);
    let f = d.slice(0, 3);
    if (d.length > 3) f += ' ' + d.slice(3, 5);
    if (d.length > 5) f += ' ' + d.slice(5, 8);
    if (d.length > 8) f += ' ' + d.slice(8, 10);
    return f;
  },
  [INPUT_TYPES.EMAIL]: (v) => v.toLowerCase().replace(/[^a-z0-9@._-]/g, ''),
  [INPUT_TYPES.NUMBER]: (v) => v.replace(/\D/g, ''),
  [INPUT_TYPES.AMOUNT]: (v) => {
    const d = v.replace(/\D/g, '');
    return d.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  },
  [INPUT_TYPES.REFERENCE]: (v) => v.toUpperCase().replace(/[^A-Z0-9/_-]/g, ''),
};

/* ═══════════════════════════════════════════════════════════════
   VALIDATIONS SPÉCIFIQUES (messages du cahier des charges)
   ═══════════════════════════════════════════════════════════════ */
const VALIDATORS = {
  [INPUT_TYPES.CIN]: (v) => {
    const d = v.replace(/\D/g, '');
    if (!d) return null;
    if (d.length < 12) return `CIN incomplet (${d.length}/12)`;
    return null;
  },
  [INPUT_TYPES.PHONE]: (v) => {
    const d = v.replace(/\D/g, '');
    if (!d) return null;
    if (d.length < 10) return `Téléphone incomplet (${d.length}/10)`;
    if (!/^0(32|33|34|38)/.test(d)) {
      return 'Le numéro doit commencer par 032, 033, 034 ou 038';
    }
    return null;
  },
  [INPUT_TYPES.EMAIL]: (v) => {
    if (!v) return null;
    if (!/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(v)) {
      return 'Format email invalide';
    }
    return null;
  },
  [INPUT_TYPES.PASSWORD]: (v) => {
    if (!v) return null;
    if (v.length < 8) return 'Minimum 8 caractères';
    if (!/[A-Z]/.test(v)) return 'Au moins 1 majuscule';
    if (!/[a-z]/.test(v)) return 'Au moins 1 minuscule';
    if (!/\d/.test(v)) return 'Au moins 1 chiffre';
    if (!/[@$!%*?&]/.test(v)) return 'Au moins 1 caractère spécial';
    return null;
  },
};

/* Touches de navigation / édition toujours autorisées. */
const ALLOWED_KEYS = new Set([
  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Home', 'End',
]);

/**
 * Hook de contrôle de saisie.
 *
 * @param {string} initialValue Valeur initiale
 * @param {object} config
 *   - type        : INPUT_TYPES.*
 *   - minLength   : longueur minimale (hors séparateurs)
 *   - maxLength   : longueur maximale
 *   - required    : champ obligatoire
 *   - pattern     : regex supplémentaire
 *   - customValidation : fonction (valeur) => message|null
 *   - liveValidation : false pour ne valider qu'au submit (défaut true)
 *
 * @returns value, error, touched, isValid, length, remaining,
 *          handleChange, handleKeyDown, handleBlur, reset, setValue,
 *          inputProps (à étaler sur un <input>)
 */
export function useInputControl(initialValue = '', config = {}) {
  const {
    type = INPUT_TYPES.TEXT,
    minLength = 0,
    maxLength = 255,
    required = false,
    pattern = null,
    customValidation = null,
    liveValidation = true,
  } = config;

  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback(
    (val) => {
      if (!liveValidation) return null;
      if (required && (!val || val.trim() === '')) return 'Ce champ est obligatoire';

      /* Le validateur spécifique au type passe en premier : ses
         messages (« CIN incomplet (6/12) ») sont plus justes que
         la longueur brute, qui compte les séparateurs. */
      const typeValidator = VALIDATORS[type];
      if (typeValidator) {
        const err = typeValidator(val);
        if (err) return err;
      }

      if (val && minLength && val.length < minLength) {
        return `Minimum ${minLength} caractères`;
      }
      if (val && val.length > maxLength) {
        return `Maximum ${maxLength} caractères`;
      }
      if (pattern && val && !pattern.test(val)) return 'Format invalide';

      if (customValidation) {
        const err = customValidation(val);
        if (err) return err;
      }
      return null;
    },
    [required, minLength, maxLength, pattern, type, customValidation, liveValidation]
  );

  /* ═══════════════════════════════════════════════════════════
     BLOCAGE EN TEMPS RÉEL (onKeyDown) — avant l'affichage
     ═══════════════════════════════════════════════════════════ */
  const handleKeyDown = useCallback(
    (e) => {
      if (ALLOWED_KEYS.has(e.key)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Espaces interdits selon le type (§10.3)
      if (e.key === ' ' && NO_SPACE_TYPES.has(type)) {
        e.preventDefault();
        return;
      }
      // Un seul @ pour l'email
      if (type === INPUT_TYPES.EMAIL && e.key === '@' && value.includes('@')) {
        e.preventDefault();
        return;
      }
      // Nom / prénom : espace, apostrophe et tiret autorisés
      if (
        [INPUT_TYPES.UPPERCASE, INPUT_TYPES.TITLECASE].includes(type) &&
        [' ', "'", '-'].includes(e.key)
      ) {
        return;
      }

      // Blocage par pattern du type
      const keyPattern = KEY_PATTERNS[type];
      if (keyPattern && e.key.length === 1 && !keyPattern.test(e.key)) {
        e.preventDefault();
        return;
      }

      // Blocage si longueur max atteinte
      if (value.length >= maxLength && e.key.length === 1) {
        e.preventDefault();
      }
    },
    [type, value, maxLength]
  );

  /* ═══════════════════════════════════════════════════════════
     CHANGEMENT + FORMATAGE + VALIDATION
     Retourne la valeur transformée (le parent en a besoin).
     ═══════════════════════════════════════════════════════════ */
  const handleChange = useCallback(
    (e) => {
      const raw = e?.target ? e.target.value : e;
      const transformer = TRANSFORMERS[type];
      let transformed = transformer ? transformer(raw) : raw;

      if (transformed.length > maxLength) {
        transformed = transformed.slice(0, maxLength);
      }

      setValue(transformed);
      setError(validate(transformed));
      return transformed;
    },
    [type, maxLength, validate]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    setError(validate(value));
  }, [value, validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setTouched(false);
  }, [initialValue]);

  /** Écriture programmatique (avec formatage du type). */
  const setValueFormatted = useCallback(
    (v) => {
      const t = TRANSFORMERS[type];
      setValue(t ? t(v) : v);
    },
    [type]
  );

  // Synchronise si la valeur externe change (réinit, chargement…).
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== value) {
      setValue(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  return {
    value,
    error: touched ? error : null,
    touched,
    isValid: !validate(value),
    length: value.length,
    remaining: maxLength - value.length,
    handleChange,
    handleKeyDown,
    handleBlur,
    reset,
    setValue: setValueFormatted,
    inputProps: {
      value,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      error: touched ? error : null,
      'aria-invalid': Boolean(touched && error),
      'aria-required': required,
    },
  };
}

export default useInputControl;

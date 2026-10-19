import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInputControl, INPUT_TYPES } from './useInputControl.js';

/**
 * Tests du hook de contrôle de saisie (§ I à VIII du cahier des charges).
 *
 * Trois familles :
 *  - Blocage : le caractère invalide est refusé AVANT affichage (preventDefault).
 *  - Formatage / conversion : la valeur est transformée à la saisie.
 *  - Validation : messages standards, affichés après avoir quitté le champ.
 */

/** Événement clavier simulé qui trace l'appel à preventDefault. */
function keyEvent(key, opts = {}) {
  const e = {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    defaultPrevented: false,
    preventDefault() {
      e.defaultPrevented = true;
    },
    ...opts,
  };
  return e;
}

/** Déclenche handleChange (le hook accepte une chaîne brute). */
function typeValue(result, raw) {
  let out;
  act(() => {
    out = result.current.handleChange(raw);
  });
  return out;
}

/** Quitte le champ pour révéler l'erreur. */
function blur(result) {
  act(() => {
    result.current.handleBlur();
  });
}

describe('Blocage en temps réel (onKeyDown → preventDefault)', () => {
  it('accepte chiffres et lettres sur un champ matricule', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.MATRICULE })
    );
    for (const key of ['5', 'A']) {
      const e = keyEvent(key);
      act(() => result.current.handleKeyDown(e));
      expect(e.defaultPrevented).toBe(false);
    }
  });

  it('refuse un caractère étranger au matricule (@, espace, accent)', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.MATRICULE })
    );
    for (const key of ['@', ' ', 'é']) {
      const e = keyEvent(key);
      act(() => result.current.handleKeyDown(e));
      expect(e.defaultPrevented).toBe(true);
    }
  });

  it("laisse passer les chiffres et les touches de navigation", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.MATRICULE })
    );
    for (const key of ['5', 'Backspace', 'ArrowLeft', 'Tab', 'Enter']) {
      const e = keyEvent(key);
      act(() => result.current.handleKeyDown(e));
      expect(e.defaultPrevented).toBe(false);
    }
  });

  it("refuse l'espace sur un champ sans-espace (matricule, email, montant…)", () => {
    for (const type of [INPUT_TYPES.MATRICULE, INPUT_TYPES.EMAIL, INPUT_TYPES.AMOUNT]) {
      const { result } = renderHook(() => useInputControl('', { type }));
      const e = keyEvent(' ');
      act(() => result.current.handleKeyDown(e));
      expect(e.defaultPrevented).toBe(true);
    }
  });

  it("autorise l'espace sur un nom (MAJUSCULES)", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.UPPERCASE })
    );
    const e = keyEvent(' ');
    act(() => result.current.handleKeyDown(e));
    expect(e.defaultPrevented).toBe(false);
  });

  it("n'autorise qu'un seul @ sur un email", () => {
    const { result } = renderHook(() =>
      useInputControl('a@b', { type: INPUT_TYPES.EMAIL })
    );
    const e = keyEvent('@');
    act(() => result.current.handleKeyDown(e));
    expect(e.defaultPrevented).toBe(true);
  });

  it('bloque la saisie au-delà de maxLength', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.TEXT, maxLength: 5 })
    );
    typeValue(result, 'abcde');
    const e = keyEvent('f');
    act(() => result.current.handleKeyDown(e));
    expect(e.defaultPrevented).toBe(true);
  });

  it("n'applique pas le blocage sous un raccourci clavier (Ctrl/Cmd)", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.NUMBER })
    );
    const e = keyEvent('a', { ctrlKey: true });
    act(() => result.current.handleKeyDown(e));
    expect(e.defaultPrevented).toBe(false);
  });
});

describe('Formatage automatique', () => {
  it('formate un matricule chiffré en groupes de 3', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.MATRICULE })
    );
    expect(typeValue(result, '222222222')).toBe('222 222 222');
  });

  it('laisse un matricule alphanumérique d’un bloc (SRSP013)', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.MATRICULE })
    );
    expect(typeValue(result, 'srsp013')).toBe('SRSP013');
  });

  it('tronque le matricule à 10 caractères', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.MATRICULE })
    );
    expect(typeValue(result, '2222222222233')).toBe('222 222 222 2');
  });

  it('formate le téléphone 0321234567 → 032 12 345 67', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.PHONE })
    );
    expect(typeValue(result, '0321234567')).toBe('032 12 345 67');
  });

  it('formate le montant 1500000 → 1 500 000', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.AMOUNT })
    );
    expect(typeValue(result, '1500000')).toBe('1 500 000');
  });

  it("formate l'antériorité 0000 → 0000 (groupe)", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.REFERENCE })
    );
    expect(typeValue(result, 'ref_2026-01')).toBe('REF_2026-01');
  });
});

describe('Conversions automatiques', () => {
  it('convertit le nom en MAJUSCULES', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.UPPERCASE })
    );
    expect(typeValue(result, 'rakoto')).toBe('RAKOTO');
  });

  it("convertit l'email en minuscules", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.EMAIL })
    );
    expect(typeValue(result, 'User@Example.COM')).toBe('user@example.com');
  });

  it('convertit le prénom en Title Case', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.TITLECASE })
    );
    expect(typeValue(result, 'jean marc')).toBe('Jean Marc');
  });

  it('nettoie les chiffres sur un champ nombre', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.NUMBER })
    );
    expect(typeValue(result, '12a3b4')).toBe('1234');
  });
});

describe('Validation temps réel', () => {
  it("affiche « Matricule incomplet (1/2) » après avoir quitté le champ", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.MATRICULE })
    );
    typeValue(result, '2');
    // Tant que le champ n'est pas quitté, aucune erreur affichée.
    expect(result.current.error).toBeNull();
    blur(result);
    expect(result.current.error).toBe('Matricule incomplet (1/2)');
  });

  it('accepte un matricule de 2 à 10 caractères', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.MATRICULE })
    );
    typeValue(result, '22222');
    blur(result);
    expect(result.current.error).toBeNull();
    expect(result.current.isValid).toBe(true);
  });

  it("affiche « Ce champ est obligatoire » sur champ requis vide", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.TEXT, required: true })
    );
    blur(result);
    expect(result.current.error).toBe('Ce champ est obligatoire');
  });

  it("détecte un email au format invalide", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.EMAIL })
    );
    typeValue(result, 'pas-un-email');
    blur(result);
    expect(result.current.error).toBe('Format email invalide');
  });

  it('accepte un email valide', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.EMAIL })
    );
    typeValue(result, 'agent@srsp.gov.mg');
    blur(result);
    expect(result.current.error).toBeNull();
  });

  it('refuse un téléphone hors préfixe 032/033/034/038', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.PHONE })
    );
    typeValue(result, '0123456789');
    blur(result);
    expect(result.current.error).toContain('032, 033, 034 ou 038');
  });

  it('applique la longueur minimale', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.TEXT, minLength: 3 })
    );
    typeValue(result, 'ab');
    blur(result);
    expect(result.current.error).toBe('Minimum 3 caractères');
  });

  it('borne la saisie en temps réel à maxLength', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.TEXT, maxLength: 10 })
    );
    // La saisie est tronquée à 10 : le champ est plein, donc valide, pas d'erreur.
    typeValue(result, 'x'.repeat(11));
    expect(result.current.value).toBe('x'.repeat(10));
    expect(result.current.error).toBeNull();
  });

  it("applique « Maximum X caractères » sur une valeur programmatique trop longue", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.TEXT, maxLength: 10 })
    );
    act(() => result.current.setValue('y'.repeat(11)));
    blur(result);
    expect(result.current.error).toBe('Maximum 10 caractères');
  });
});

describe('Validation du mot de passe', () => {
  it('exige 8 caractères minimum', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.PASSWORD })
    );
    typeValue(result, 'Ab1@xy');
    blur(result);
    expect(result.current.error).toBe('Minimum 8 caractères');
  });

  it('exige une majuscule', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.PASSWORD })
    );
    typeValue(result, 'abcdefg1@');
    blur(result);
    expect(result.current.error).toBe('Au moins 1 majuscule');
  });

  it('exige un chiffre', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.PASSWORD })
    );
    typeValue(result, 'Abcdefgh@');
    blur(result);
    expect(result.current.error).toBe('Au moins 1 chiffre');
  });

  it('exige un caractère spécial', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.PASSWORD })
    );
    typeValue(result, 'Abcdefg12');
    blur(result);
    expect(result.current.error).toBe('Au moins 1 caractère spécial');
  });

  it('accepte un mot de passe conforme', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.PASSWORD })
    );
    typeValue(result, 'Abcdefg1@');
    blur(result);
    expect(result.current.error).toBeNull();
    expect(result.current.isValid).toBe(true);
  });
});

describe('Compteurs et API', () => {
  it("expose la longueur restante", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.TEXT, maxLength: 10 })
    );
    typeValue(result, 'abc');
    expect(result.current.length).toBe(3);
    expect(result.current.remaining).toBe(7);
  });

  it('réinitialise la valeur et l’erreur', () => {
    const { result } = renderHook(() =>
      useInputControl('départ', { type: INPUT_TYPES.TEXT, required: true })
    );
    expect(result.current.value).toBe('départ');
    act(() => result.current.reset());
    expect(result.current.value).toBe('départ');
    expect(result.current.touched).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('setValue formate la valeur écrite programmatiquement', () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.AMOUNT })
    );
    act(() => result.current.setValue('900000'));
    expect(result.current.value).toBe('900 000');
  });

  it("inputProps reflète valeur + état d'accessibilité", () => {
    const { result } = renderHook(() =>
      useInputControl('', { type: INPUT_TYPES.MATRICULE, required: true })
    );
    expect(result.current.inputProps.value).toBe('');
    expect(result.current.inputProps['aria-required']).toBe(true);
    expect(result.current.inputProps['aria-invalid']).toBe(false);
    blur(result);
    expect(result.current.inputProps['aria-invalid']).toBe(true);
  });
});

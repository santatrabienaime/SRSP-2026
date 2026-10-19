/**
 * Composants de champ à contrôle de saisie automatique — SRSP Fitovinany v2.0.
 *
 * Chaque composant encapsule le hook `useInputControl` et le UI
 * existant (`Input`, `Textarea`). Le caractère invalide est bloqué
 * avant affichage ; les conversions (MAJUSCULES, minuscules,
 * Title Case) et les formatages (matricule, téléphone, montant) sont
 * appliqués automatiquement.
 *
 * Convention : `onChange` reçoit la valeur FORMATÉE (chaîne),
 * jamais l'événement — le parent peut la stocker directement.
 */
import { useState, useRef } from 'react';
import { Input } from '../ui/Input.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { useInputControl, INPUT_TYPES, MATRICULE_LONGUEUR_MAX } from '../../hooks/useInputControl.js';

/* ═══════════════════════════════════════════════════════════
   1. MatriculeInput — matricule de 2 à 10 caractères, groupes de 3
   ═══════════════════════════════════════════════════════════ */
export function MatriculeInput({ label = 'N° matricule', value, onChange, error, required, hint, ...props }) {
  /* Aucune longueur n'est imposée au hook, ni au champ : la borne haute (10) est
     appliquée par le formatage, à la frappe. Mais un numéro déjà enregistré
     avant la règle peut être plus long, et le service l'accepte tel quel tant
     qu'il n'est pas modifié : le plafonner ici gèlerait la saisie d'un dossier
     ancien, et afficherait une erreur là où le service, lui, accepte. */
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.MATRICULE,
    required,
  });

  const saisis = control.value.replace(/[^A-Za-z0-9]/g, '').length;

  return (
    <Input
      label={label}
      required={required}
      {...control.inputProps}
      error={error || control.error}
      autoComplete="off"
      clearable
      placeholder="222 222 222"
      hint={
        hint ??
        (!control.error && saisis > 0 && saisis < MATRICULE_LONGUEUR_MAX
          ? `${saisis}/${MATRICULE_LONGUEUR_MAX} caractères`
          : undefined)
      }
      onChange={(e) => onChange?.(control.handleChange(e))}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   2. PhoneInput — 032 XX XXX XX (10 chiffres, préfixe 032/033/034/038)
   ═══════════════════════════════════════════════════════════ */
export function PhoneInput({ label = 'Téléphone', value, onChange, error, required, ...props }) {
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.PHONE,
    required,
    maxLength: 13,
  });

  return (
    <Input
      label={label}
      type="tel"
      required={required}
      {...control.inputProps}
      error={error || control.error}
      maxLength={13}
      inputMode="numeric"
      autoComplete="tel"
      clearable
      showCounter
      hint="10 chiffres, préfixe 032/033/034/038"
      placeholder="032 12 345 67"
      onChange={(e) => onChange?.(control.handleChange(e))}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   16. UsernameInput — identifiant (minuscules, a-z0-9@._-)
   ═══════════════════════════════════════════════════════════ */
export function UsernameInput({ label = 'Identifiant', value, onChange, error, required, ...props }) {
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.LOWERCASE,
    required,
    minLength: 3,
    maxLength: 100,
  });

  return (
    <Input
      label={label}
      required={required}
      {...control.inputProps}
      error={error || control.error}
      maxLength={100}
      autoComplete="username"
      autoCapitalize="none"
      spellCheck="false"
      clearable
      showCounter
      placeholder="prenom.nom"
      onChange={(e) => onChange?.(control.handleChange(e))}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   3. EmailInput — minuscules automatiques, un seul @
   ═══════════════════════════════════════════════════════════ */
export function EmailInput({ label = 'Email', value, onChange, error, required, ...props }) {
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.EMAIL,
    required,
    maxLength: 255,
  });

  return (
    <Input
      label={label}
      type="email"
      required={required}
      {...control.inputProps}
      error={error || control.error}
      maxLength={255}
      autoComplete="email"
      clearable
      placeholder="nom@srsp.mg"
      onChange={(e) => onChange?.(control.handleChange(e))}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   4. NameInput — Nom en MAJUSCULES automatiques
   ═══════════════════════════════════════════════════════════ */
export function NameInput({ label = 'Nom', value, onChange, error, required, ...props }) {
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.UPPERCASE,
    required,
    minLength: 2,
    maxLength: 100,
  });

  return (
    <Input
      label={label}
      required={required}
      {...control.inputProps}
      error={error || control.error}
      maxLength={100}
      autoComplete="family-name"
      clearable
      placeholder="RAKOTO"
      className="uppercase"
      onChange={(e) => onChange?.(control.handleChange(e))}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   5. FirstNameInput — Prénom en Title Case automatique
   ═══════════════════════════════════════════════════════════ */
export function FirstNameInput({ label = 'Prénom', value, onChange, error, required, ...props }) {
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.TITLECASE,
    required,
    minLength: 2,
    maxLength: 100,
  });

  return (
    <Input
      label={label}
      required={required}
      {...control.inputProps}
      error={error || control.error}
      maxLength={100}
      autoComplete="given-name"
      clearable
      placeholder="Jean"
      onChange={(e) => onChange?.(control.handleChange(e))}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   6. AmountInput — Montant formaté 1 500 000
   ═══════════════════════════════════════════════════════════ */
export function AmountInput({
  label = 'Montant (Ar)',
  value,
  onChange,
  error,
  required,
  max = 10000000,
  ...props
}) {
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.AMOUNT,
    required,
    maxLength: 14,
  });

  const digits = control.value.replace(/\D/g, '');
  const num = digits ? parseInt(digits, 10) : 0;
  const depasse = num > max;

  return (
    <Input
      label={label}
      required={required}
      {...control.inputProps}
      error={error || control.error || (depasse ? `Maximum ${max.toLocaleString('fr-FR')} Ar` : null)}
      maxLength={14}
      inputMode="numeric"
      clearable
      placeholder="1 500 000"
      hint={`Maximum : ${max.toLocaleString('fr-FR')} Ar`}
      onChange={(e) => onChange?.(control.handleChange(e))}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   7. PasswordInput — mot de passe + indicateur de force
   (la masque/révéler est assuré par le composant Input)
   ═══════════════════════════════════════════════════════════ */
export function PasswordInput({
  label = 'Mot de passe',
  value,
  onChange,
  error,
  required,
  showStrength = true,
  ...props
}) {
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.PASSWORD,
    required,
    maxLength: 128,
  });

  const criteria = {
    length: control.value.length >= 8,
    uppercase: /[A-Z]/.test(control.value),
    lowercase: /[a-z]/.test(control.value),
    number: /\d/.test(control.value),
    special: /[@$!%*?&]/.test(control.value),
  };
  const strength = Object.values(criteria).filter(Boolean).length;
  const strengthLabel = strength <= 2 ? 'Faible' : strength <= 4 ? 'Moyen' : 'Fort';
  const strengthColor =
    strength <= 2 ? '#ef4444' : strength <= 4 ? '#eab308' : '#22c55e';

  return (
    <div className="space-y-1">
      <Input
        label={label}
        type="password"
        revealPassword
        required={required}
        {...control.inputProps}
        error={error || control.error}
        maxLength={128}
        autoComplete="new-password"
        placeholder="••••••••"
        onChange={(e) => onChange?.(control.handleChange(e))}
        {...props}
      />
      {showStrength && control.value && (
        <>
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded bg-slate-200">
              <div
                className="h-1.5 rounded transition-all"
                style={{
                  width: `${(strength / 5) * 100}%`,
                  backgroundColor: strengthColor,
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: strengthColor }}>
              {strengthLabel}
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-0.5 text-xs">
            <li className={criteria.length ? 'text-emerald-600' : 'text-slate-400'}>
              {criteria.length ? '✅' : '○'} 8 caractères
            </li>
            <li className={criteria.uppercase ? 'text-emerald-600' : 'text-slate-400'}>
              {criteria.uppercase ? '✅' : '○'} 1 majuscule
            </li>
            <li className={criteria.lowercase ? 'text-emerald-600' : 'text-slate-400'}>
              {criteria.lowercase ? '✅' : '○'} 1 minuscule
            </li>
            <li className={criteria.number ? 'text-emerald-600' : 'text-slate-400'}>
              {criteria.number ? '✅' : '○'} 1 chiffre
            </li>
            <li className={criteria.special ? 'text-emerald-600' : 'text-slate-400'}>
              {criteria.special ? '✅' : '○'} 1 spécial
            </li>
          </ul>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   8. SearchInput — recherche avec debounce
   ═══════════════════════════════════════════════════════════ */
export function SearchInput({ label = 'Recherche', onSearch, delay = 300, ...props }) {
  const [query, setQuery] = useState('');
  const timer = useRef(null);

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    if (v.length < 2) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch?.(v), delay);
  };

  return (
    <Input
      label={label}
      value={query}
      clearable
      onChange={handleChange}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setQuery('');
      }}
      placeholder="Rechercher… (min. 2 caractères)"
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   9. TextAreaInput — zone de texte avec compteur
   ═══════════════════════════════════════════════════════════ */
export function TextAreaInput({
  label = 'Description',
  value,
  onChange,
  error,
  maxLength = 500,
  rows = 4,
  required,
  ...props
}) {
  const v = value || '';
  return (
    <Textarea
      label={label}
      required={required}
      value={v}
      error={error}
      success={Boolean(v.trim()) && !error}
      maxLength={maxLength}
      showCounter
      rows={rows}
      aria-invalid={Boolean(error)}
      aria-required={required}
      onChange={(e) => onChange?.(e.target.value.slice(0, maxLength))}
      onKeyDown={(e) => {
        if (v.length >= maxLength && e.key.length === 1) e.preventDefault();
      }}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   10. DateInput — date avec bornes
   ═══════════════════════════════════════════════════════════ */
export function DateInput({
  label = 'Date',
  value,
  onChange,
  error,
  required,
  minDate,
  maxDate,
  ...props
}) {
  return (
    <Input
      label={label}
      type="date"
      required={required}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      min={minDate}
      max={maxDate}
      error={error}
      success={Boolean(value)}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   11. ReferenceInput — référence MAJUSCULES (A-Z, 0-9, /, _, -)
   ═══════════════════════════════════════════════════════════ */
export function ReferenceInput({ label = 'Référence', value, onChange, error, required, ...props }) {
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.REFERENCE,
    required,
    minLength: 3,
    maxLength: 50,
  });

  return (
    <Input
      label={label}
      required={required}
      {...control.inputProps}
      error={error || control.error}
      maxLength={50}
      autoComplete="off"
      clearable
      showCounter
      placeholder="BE-2025-001"
      className="uppercase"
      onChange={(e) => onChange?.(control.handleChange(e))}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   12. NumberInput — nombre entier
   ═══════════════════════════════════════════════════════════ */
export function NumberInput({
  label = 'Nombre',
  value,
  onChange,
  error,
  required,
  min,
  max,
  ...props
}) {
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.NUMBER,
    required,
    maxLength: 10,
  });

  return (
    <Input
      label={label}
      type="number"
      required={required}
      {...control.inputProps}
      min={min}
      max={max}
      maxLength={10}
      clearable
      showCounter
      error={error || control.error}
      onChange={(e) => onChange?.(control.handleChange(e))}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   13. DecimalInput — décimal (un seul point)
   ═══════════════════════════════════════════════════════════ */
export function DecimalInput({ label = 'Valeur', value, onChange, error, required, ...props }) {
  const handleKeyDown = (e) => {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
    ];
    if (allowed.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '.') {
      if ((value || '').includes('.')) e.preventDefault();
      return;
    }
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  return (
    <Input
      label={label}
      required={required}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={handleKeyDown}
      error={error}
      inputMode="decimal"
      clearable
      placeholder="0.00"
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   14. AddressInput — adresse (255 caractères max)
   ═══════════════════════════════════════════════════════════ */
export function AddressInput({ value, onChange, error, required, ...props }) {
  return (
    <TextAreaInput
      label="Adresse"
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      maxLength={255}
      rows={2}
      placeholder="Ambodiaplay, Manakara"
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   15. ObservationInput — observations (1000 caractères max)
   ═══════════════════════════════════════════════════════════ */
export function ObservationInput({ value, onChange, error, ...props }) {
  return (
    <TextAreaInput
      label="Observations"
      value={value}
      onChange={onChange}
      error={error}
      maxLength={1000}
      rows={4}
      placeholder="Observations éventuelles…"
      {...props}
    />
  );
}

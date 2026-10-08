/**
 * Composants de champ à contrôle de saisie automatique — SRSP Fitovinany v2.0.
 *
 * Chaque composant encapsule le hook `useInputControl` et le UI
 * existant (`Input`, `Textarea`). Le caractère invalide est bloqué
 * avant affichage ; les conversions (MAJUSCULES, minuscules,
 * Title Case) et les formatages (CIN, téléphone, montant) sont
 * appliqués automatiquement.
 *
 * Convention : `onChange` reçoit la valeur FORMATÉE (chaîne),
 * jamais l'événement — le parent peut la stocker directement.
 */
import { useState, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { useInputControl, INPUT_TYPES } from '../../hooks/useInputControl.js';

/* ═══════════════════════════════════════════════════════════
   1. CINInput — CIN formaté XXX XXX XXX XXX (12 chiffres)
   ═══════════════════════════════════════════════════════════ */
export function CINInput({ label = 'CIN', value, onChange, error, required, hint, ...props }) {
  const control = useInputControl(value || '', {
    type: INPUT_TYPES.CIN,
    required,
    minLength: 12,
    maxLength: 15,
  });

  const digits = control.value.replace(/\D/g, '');
  const complet = digits.length === 12;

  return (
    <div>
      <Input
        label={label}
        required={required}
        {...control.inputProps}
        error={error || control.error}
        maxLength={15}
        inputMode="numeric"
        autoComplete="off"
        placeholder="101 234 567 890"
        hint={
          hint ??
          (!control.error && digits.length > 0 && !complet
            ? `${digits.length}/12 chiffres`
            : undefined)
        }
        onChange={(e) => onChange?.(control.handleChange(e))}
        {...props}
      />
      {complet && !control.error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="h-3 w-3" /> CIN complet
        </p>
      )}
    </div>
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
    <div className="space-y-1">
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={v}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-required={required}
        onChange={(e) => onChange?.(e.target.value.slice(0, maxLength))}
        onKeyDown={(e) => {
          if (v.length >= maxLength && e.key.length === 1) e.preventDefault();
        }}
        className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-red-400' : 'border-slate-300'}`}
        {...props}
      />
      <div className="flex justify-between">
        <span className="text-xs text-red-600">{error}</span>
        <span
          className={`text-xs ${
            v.length >= maxLength * 0.9 ? 'text-red-500' : 'text-slate-400'
          }`}
        >
          {v.length}/{maxLength}
        </span>
      </div>
    </div>
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

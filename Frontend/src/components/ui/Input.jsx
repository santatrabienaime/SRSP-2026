import { forwardRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, X } from 'lucide-react';

const base =
  'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 disabled:text-slate-400';

/**
 * Bordure du champ : rouge quand la saisie est refusée, verte quand elle est
 * reconnue bonne. Le neutre reste le repos — l'agent voit d'un coup d'œil ce
 * qui est déjà bon et ce qui ne l'est pas, sans lire de message.
 */
const stateCls = (error, success) =>
  error
    ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
    : success
      ? 'border-emerald-400 focus:ring-emerald-500 focus:border-emerald-500'
      : 'border-slate-300';

/**
 * Ton sombre, pour les écrans à fond sombre (connexion). Le ton clair reste le
 * défaut : aucun écran existant n'est modifié.
 */
const DARK = {
  wrap: 'space-y-1.5',
  label: 'mb-0 block text-[11px] font-semibold uppercase tracking-wider text-white/60',
  required: 'text-cyan-400',
  input:
    'block w-full rounded-lg border border-white/12 bg-white/[.06] px-3.5 py-2.5 text-sm ' +
    'text-white placeholder:text-white/30 backdrop-blur-sm transition-all duration-200 ' +
    'focus:outline-none focus:bg-white/[.10] focus:border-cyan-300/70 focus:ring-4 ' +
    'focus:ring-cyan-400/15',
  inputAvecBouton: 'pr-20',
  error: 'border-red-400/70 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20',
  success: 'border-emerald-400/60 bg-emerald-500/10 focus:border-emerald-300',
  hint: 'flex items-center gap-1 text-white/40',
  errorText: 'flex items-center gap-1 text-red-300',
  okText: 'flex items-center gap-1 text-emerald-300',
  compteur: 'text-white/40',
  compteurPlein: 'font-medium text-amber-300',
  bouton: 'text-white/40 hover:text-cyan-300',
};

const CLAIR = {
  label: 'mb-1 block text-sm font-medium text-slate-700',
  required: 'text-red-500',
  inputAvecBouton: 'pr-20',
  hint: 'mt-1 text-xs text-slate-500',
  errorText: 'mt-1 flex items-center gap-1 text-xs text-red-600',
  okText: 'mt-1 flex items-center gap-1 text-xs text-emerald-600',
  compteur: 'mt-1 text-xs text-slate-400',
  compteurPlein: 'mt-1 text-xs font-medium text-amber-600',
  bouton: 'text-slate-400 hover:text-slate-700',
};

/**
 * Champ de saisie — messages d'alerte et aides, identiques sur tous les écrans.
 *
 * Chaque champ peut afficher, sous lui : son erreur (rouge), sa confirmation
 * (vert) ou son format attendu (gris), et un compteur de caractères. Une coche
 * verte et un bouton d'effacement s'ajoutent dans le champ quand c'est utile.
 *
 * `success`, `successMessage`, `showCounter`, `clearable` et `revealPassword`
 * sont des options d'affichage : elles ne sont jamais transmises à l'élément
 * HTML, qui les rendrait telles quelles dans le DOM.
 */
export const Input = forwardRef(function Input(
  {
    label, error, hint, className = '', id, required, tone = 'light',
    success = false,
    successMessage,
    showCounter = false,
    clearable = false,
    // Affiche un œil pour révéler le mot de passe.
    revealPassword = false,
    // `type` est extrait des props : sinon le {...props} qui suit réinjecterait
    // type="password" par-dessus le type calculé, et l'œil n'aurait aucun effet.
    type = 'text',
    // `value` et `onChange` sont extraits pour que le bouton d'effacement
    // puisse vider le champ par le même chemin qu'une frappe.
    value,
    onChange,
    ...props
  },
  ref
) {
  const inputId = id || props.name || label;
  const sombre = tone === 'dark';
  const [visible, setVisible] = useState(false);

  const rempli = value !== undefined && value !== null && String(value) !== '';
  const borneHaute = typeof props.maxLength === 'number' ? props.maxLength : null;
  const compteur = showCounter && borneHaute ? `${String(value ?? '').length}/${borneHaute}` : null;
  const plein = compteur && String(value ?? '').length >= borneHaute;

  /* Priorité du message : l'erreur passe avant tout, puis la confirmation, puis
     l'indication de format. Un champ n'affiche jamais deux phrases à la fois. */
  const texte = error || (success ? successMessage : null) || hint;
  const estErreur = Boolean(error);
  const estOk = !error && Boolean(success && successMessage);

  const effacer = () => onChange?.({ target: { value: '' } });
  const aBouton = revealPassword || (clearable && rempli) || (success && !error);

  const cls = sombre ? DARK : CLAIR;

  return (
    <div className={sombre ? `${DARK.wrap} ${className}` : className}>
      {label && (
        <label htmlFor={inputId} className={cls.label}>
          {label} {required && <span className={cls.required}>*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={revealPassword && visible ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={texte ? `${inputId}-message` : undefined}
          className={
            sombre
              ? `${DARK.input} ${error ? DARK.error : success ? DARK.success : ''} ${
                  aBouton ? DARK.inputAvecBouton : ''
                }`
              : `${base} ${stateCls(error, success)} ${aBouton ? CLAIR.inputAvecBouton : ''}`
          }
          value={value}
          onChange={onChange}
          {...props}
        />

        {aBouton && (
          <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-2">
            {success && !error && (
              <CheckCircle2
                className={`h-4 w-4 ${sombre ? 'text-emerald-400' : 'text-emerald-500'}`}
                aria-hidden="true"
              />
            )}
            {clearable && rempli && (
              <button
                type="button"
                onClick={effacer}
                aria-label="Effacer le champ"
                title="Effacer"
                className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${cls.bouton}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {revealPassword && (
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={visible}
                className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${cls.bouton}`}
              >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}
      </div>

      {(texte || compteur) && (
        <div className="flex items-start justify-between gap-2">
          {texte ? (
            <p
              id={`${inputId}-message`}
              className={cls[estErreur ? 'errorText' : estOk ? 'okText' : 'hint']}
            >
              {estErreur && <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />}
              {estOk && <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />}
              {texte}
            </p>
          ) : (
            <span />
          )}
          {compteur && (
            <span className={plein ? cls.compteurPlein : cls.compteur}>{compteur}</span>
          )}
        </div>
      )}
    </div>
  );
});

export default Input;
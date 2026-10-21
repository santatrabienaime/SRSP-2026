import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert, ArrowLeft, ShieldCheck, MapPin, Phone, Mail, KeyRound, CheckCircle2,
} from 'lucide-react';
import { authService } from '../../services/authService.js';
import { useInputControl, INPUT_TYPES } from '../../hooks/useInputControl.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import {
  passwordRules, isStrongPassword, failedPasswordRules, PASSWORD_MESSAGE,
} from '../../utils/password.js';

/**
 * Consommation du code de réinitialisation.
 *
 * L'agent saisit le code que l'administrateur lui a remis, puis choisit son
 * nouveau mot de passe. Le code est à six chiffres, à usage unique, et
 * valable quinze minutes ; le serveur ne distingue pas un code faux d'un
 * code expiré, et l'écran non plus.
 *
 * Changer son mot de passe ferme les sessions ouvertes : c'est la raison
 * d'être de l'opération. L'agent est donc ramené à l'écran de connexion.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();

  const identifiant = useInputControl('', {
    type: INPUT_TYPES.LOWERCASE,
    maxLength: 255,
  });
  const code = useInputControl('', {
    type: INPUT_TYPES.NUMBER,
    maxLength: 6,
  });
  const nouveau = useInputControl('', {
    type: INPUT_TYPES.PASSWORD,
    maxLength: 128,
  });
  const confirmation = useInputControl('', {
    type: INPUT_TYPES.PASSWORD,
    maxLength: 128,
  });

  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);
  const premierChamp = useRef(null);

  useEffect(() => {
    premierChamp.current?.focus();
  }, []);

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur(null);

    const ident = identifiant.value.trim();
    const chiffres = code.value.trim();

    if (!ident || !chiffres) {
      setErreur({ message: 'Renseignez votre identifiant et le code reçu.' });
      return;
    }
    if (!/^[0-9]{6}$/.test(chiffres)) {
      setErreur({ message: 'Le code comporte six chiffres.' });
      return;
    }
    if (!isStrongPassword(nouveau.value)) {
      setErreur({
        message: PASSWORD_MESSAGE,
        details: failedPasswordRules(nouveau.value),
      });
      return;
    }
    if (nouveau.value !== confirmation.value) {
      setErreur({ message: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    setChargement(true);
    try {
      await authService.resetPassword(ident, chiffres, nouveau.value);
      setSucces(true);
      // La session a été fermée : on ramène l'agent à l'écran de connexion.
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setErreur(err);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="palette-nuit relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-950 px-4 py-6 sm:py-8">
      {/* Décor identique */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#1e3a8a_0%,#0b1220_45%,#020617_100%)]" />
        <div className="absolute inset-0 grille-futur" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-600/20 blur-3xl motion-safe:animate-halo" />
        <div
          className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-cyan-600/12 blur-3xl motion-safe:animate-halo"
          style={{ animationDelay: '-7s' }}
        />
      </div>

      <div className="relative flex w-full max-w-md flex-col items-center justify-center">
        <div className="relative w-full min-h-[18rem] sm:min-h-[20rem] flex flex-col justify-center">
          {/* Monogramme cohérent */}
          <div className="mb-4 flex justify-center">
            <div className="lueur-logo flex h-12 w-12 items-center justify-center rounded-xl bg-white/[.07] text-[13px] font-bold tracking-wider text-white backdrop-blur-md">
              SRSP
            </div>
          </div>

          {/* Carte verre identique */}
          <div className="verre relative rounded-2xl p-4 shadow-xl shadow-slate-950/60 ring-1 ring-white/10 sm:p-6 motion-safe:animate-monte">
            <Link
              to="/login"
              className="group -ml-1 mb-4 inline-flex items-center gap-1.5 text-[10px] font-medium text-white/45 transition-colors hover:text-cyan-300"
            >
              <ArrowLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Retour
            </Link>

            <div className="flex items-center justify-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-300/80" />
              <h2 className="text-center text-base font-semibold text-white">
                Nouveau mot de passe
              </h2>
            </div>
            <p className="mt-1 text-center text-[10px] text-white/45">
              Saisissez le code reçu de l&apos;administrateur
            </p>

            {succes ? (
              <div className="relative z-10 mt-4 space-y-3">
                <Alert type="success" title="Mot de passe réinitialisé">
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de
                  passe. Vos sessions précédentes ont été fermées.
                </Alert>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/45">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Redirection vers l&apos;écran de connexion…
                </div>
                <Link to="/login" className="block">
                  <Button variant="accent" className="w-full py-2.5 text-[14px]">
                    Aller à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {erreur && (
                  <div className="relative z-10 mt-3">
                    <Alert type="error" title="Réinitialisation impossible">
                      {erreur.message}
                    </Alert>
                  </div>
                )}

                <form onSubmit={soumettre} className="relative z-10 mt-4 space-y-3" noValidate>
                  <Input
                    tone="dark"
                    label="Identifiant ou email"
                    required
                    clearable
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                    ref={premierChamp}
                    {...identifiant.inputProps}
                    placeholder="prenom.nom@srsp.mg"
                  />

                  <Input
                    tone="dark"
                    label="Code de réinitialisation"
                    required
                    clearable
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    hint="Six chiffres, valable quinze minutes."
                    {...code.inputProps}
                    placeholder="123456"
                  />

                  <div>
                    <label
                      htmlFor="nouveau-mot-de-passe"
                      className="mb-1 block text-[10px] font-medium text-white/50"
                    >
                      Nouveau mot de passe <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="nouveau-mot-de-passe"
                      type="password"
                      autoComplete="new-password"
                      maxLength={128}
                      value={nouveau.value}
                      onChange={(e) => nouveau.handleChange(e)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-white/10 bg-white/[.06] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <ul className="mt-1.5 grid grid-cols-1 gap-0.5 text-[10px] text-white/40 sm:grid-cols-2">
                      {passwordRules.map((regle) => {
                        const ok = regle.test(nouveau.value);
                        return (
                          <li key={regle.label} className={ok ? 'text-emerald-400' : ''}>
                            {ok ? '✅' : '○'} {regle.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmation-mot-de-passe"
                      className="mb-1 block text-[10px] font-medium text-white/50"
                    >
                      Confirmer le mot de passe <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="confirmation-mot-de-passe"
                      type="password"
                      autoComplete="new-password"
                      maxLength={128}
                      value={confirmation.value}
                      onChange={(e) => confirmation.handleChange(e)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-white/10 bg-white/[.06] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    loading={chargement}
                    className="mt-1 w-full py-2.5 text-[14px] transition-transform"
                  >
                    <KeyRound className="h-4 w-4" /> Réinitialiser le mot de passe
                  </Button>
                </form>

                <p className="mt-3 rounded-lg bg-white/[.04] p-2.5 text-[10px] leading-relaxed text-white/45 ring-1 ring-white/5">
                  Changer votre mot de passe ferme les sessions ouvertes sur
                  votre compte, y compris celle-ci : vous devrez vous reconnecter.
                </p>

                <div className="mt-3 text-center">
                  <Link
                    to="/mot-de-passe-oublie"
                    className="text-[11px] font-medium text-white/50 transition-colors hover:text-cyan-300"
                  >
                    Je n&apos;ai pas encore de code
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[10px] text-white/35">
          <ShieldCheck className="h-3 w-3 shrink-0" />
          Plateforme interne — accès réservé au personnel autorisé du SRSP.
        </p>

        <footer className="mt-2 w-full text-center text-[10px] text-white/40">
          <address className="not-italic">
            <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0 text-white/30" />
                Ambodiaplay, Manakara
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0 text-white/30" />
                <a href="tel:+261321109010" className="transition-colors hover:text-white">
                  +261 32 11 090 10
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3 w-3 shrink-0 text-white/30" />
                <a
                  href="mailto:srsp.fitovinany@dgfag.mg"
                  className="transition-colors hover:text-white"
                >
                  srsp.fitovinany@dgfag.mg
                </a>
              </span>
            </p>
          </address>
        </footer>
      </div>
    </div>
  );
}

export default ResetPasswordPage;

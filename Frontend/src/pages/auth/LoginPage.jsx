import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, MapPin, Phone, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { useInputControl, INPUT_TYPES } from '../../hooks/useInputControl.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { landingPathFor } from '../../utils/landing.js';

export function LoginPage() {
  const { login } = useAuth();
  const { toastSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const identifiant = useInputControl('', {
    type: INPUT_TYPES.LOWERCASE,
    maxLength: 255,
  });
  const password = useInputControl('', {
    type: INPUT_TYPES.PASSWORD,
    maxLength: 128,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [etape, setEtape] = useState('accueil');
  const premierChamp = useRef(null);
  const boutonAccueil = useRef(null);

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    if (etape === 'formulaire') premierChamp.current?.focus();
  }, [etape]);

  const ouvrirFormulaire = () => {
    setError(null);
    setEtape('formulaire');
  };

  const revenir = () => {
    setError(null);
    setEtape('accueil');
    boutonAccueil.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const id = identifiant.value.trim();
    if (!id || !password.value) {
      setError({ message: 'Veuillez renseigner votre identifiant et votre mot de passe.' });
      return;
    }
    setLoading(true);
    try {
      const profil = await login(id, password.value);
      toastSuccess('Connexion réussie.');
      navigate(landingPathFor(profil, from), { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="palette-nuit relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-950 px-4 py-6 sm:py-8">
      {/* Décor : fond dégradé, trame technique et halos */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#1e3a8a_0%,#0b1220_45%,#020617_100%)]" />
        <div className="absolute inset-0 grille-futur" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-600/20 blur-3xl motion-safe:animate-halo" />
        <div
          className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-cyan-600/12 blur-3xl motion-safe:animate-halo"
          style={{ animationDelay: '-7s' }}
        />
      </div>

      {/* Bloc centré */}
      <div className="relative flex w-full max-w-md flex-col items-center justify-center">
        <div className="relative w-full min-h-[18rem] sm:min-h-[20rem]">
          {/* ================= ÉTAPE 1 : accueil ================= */}
          <section
            aria-hidden={etape !== 'accueil'}
            inert={etape !== 'accueil'}
            className={`flex flex-col items-center justify-center px-1 text-center transition-all duration-500 ease-out motion-reduce:transition-none ${
              etape === 'accueil'
                ? 'relative z-10 translate-y-0 scale-100 opacity-100 blur-0'
                : 'pointer-events-none absolute inset-0 z-0 -translate-y-3 scale-[.97] opacity-0 blur-md'
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50 motion-safe:animate-ligne">
              République de Madagascar
            </p>
            <p className="mt-1 text-[11px] italic text-white/40 motion-safe:animate-ligne" style={{ animationDelay: '60ms' }}>
              Fitiavana &mdash; Tanindrazana &mdash; Fandrosoana
            </p>

            <div aria-hidden="true" className="my-4 w-full max-w-[16rem] space-y-[3px]">
              <div className="h-px w-full origin-left scale-x-0 bg-gradient-to-r from-white/45 to-transparent motion-safe:animate-[monte_.7s_.2s_cubic-bezier(.22,1,.36,1)_forwards]" />
              <div className="h-px w-full origin-right scale-x-0 bg-gradient-to-l from-white/20 to-transparent motion-safe:animate-[monte_.7s_.28s_cubic-bezier(.22,1,.36,1)_forwards]" />
            </div>

            <p className="max-w-xs text-[11px] font-bold uppercase leading-relaxed tracking-wide text-white/85 motion-safe:animate-ligne" style={{ animationDelay: '340ms' }}>
              Ministère de l&apos;Économie et des Finances
            </p>
            <h1
              className="mt-1.5 max-w-sm text-[18px] font-semibold leading-tight motion-safe:animate-ligne texte-degrade sm:text-[20px]"
              style={{ animationDelay: '400ms' }}
            >
              Service Régional de la Solde et des Pensions Fitovinany
            </h1>

            <p className="mt-3.5 max-w-xs text-[12px] leading-relaxed text-white/45 motion-safe:animate-ligne" style={{ animationDelay: '460ms' }}>
              Plateforme de gestion des dossiers administratifs : réception,
              orientation, instruction, validation et archivage, avec
              traçabilité complète des actes.
            </p>

            {/* Bouton unique — sans icônes */}
            <Button
              ref={boutonAccueil}
              type="button"
              variant="accent"
              onClick={ouvrirFormulaire}
              className="mt-5 w-full px-6 py-2.5 text-[14px] transition-transform motion-safe:animate-monte sm:mt-6 sm:w-auto"
              style={{ animationDelay: '540ms' }}
            >
              Se connecter
            </Button>
          </section>

          {/* ================= ÉTAPE 2 : formulaire ================= */}
          <section
            aria-hidden={etape !== 'formulaire'}
            inert={etape !== 'formulaire'}
            className={`flex flex-col justify-center px-1 transition-all duration-500 ease-out motion-reduce:transition-none ${
              etape === 'formulaire'
                ? 'relative z-10 translate-y-0 scale-100 opacity-100 blur-0'
                : 'pointer-events-none absolute inset-x-0 top-0 z-0 translate-y-5 scale-[.97] opacity-0 blur-md'
            }`}
          >
            <div className="mb-4 flex justify-center">
              <div className="lueur-logo flex h-12 w-12 items-center justify-center rounded-xl bg-white/[.07] text-[13px] font-bold tracking-wider text-white backdrop-blur-md">
                SRSP
              </div>
            </div>

            <div className="verre relative rounded-2xl p-4 shadow-xl shadow-slate-950/60 ring-1 ring-white/10 sm:p-6 motion-safe:animate-monte">
              <button
                type="button"
                onClick={revenir}
                className="group -ml-1 mb-4 inline-flex items-center gap-1.5 text-[10px] font-medium text-white/45 transition-colors hover:text-cyan-300"
              >
                <ArrowLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Retour
              </button>

              <h2 className="text-center text-base font-semibold text-white">
                Connexion
              </h2>
              <p className="mt-0.5 text-center text-[10px] text-white/45">
                Accédez à votre espace de travail
              </p>

              <div role="alert" aria-live="assertive" className="relative z-10 mt-3 empty:mt-0">
                {error && (
                  <div className="mb-1 motion-safe:animate-secousse">
                    <Alert type="error" title="Connexion impossible">
                      {error.message}
                    </Alert>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="relative z-10 mt-4 space-y-3" noValidate>
                <Input
                  tone="dark"
                  label="Identifiant ou email"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  ref={premierChamp}
                  {...identifiant.inputProps}
                  placeholder="prenom.nom@srsp.mg"
                />
                <Input
                  tone="dark"
                  label="Mot de passe"
                  required
                  type="password"
                  revealPassword
                  autoComplete="current-password"
                  {...password.inputProps}
                  placeholder="••••••••"
                />
                <Button
                  type="submit"
                  variant="accent"
                  loading={loading}
                  className="mt-1 w-full py-2.5 text-[14px] transition-transform"
                >
                  <LogIn className="h-4 w-4" /> Se connecter
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-[11px] font-medium text-white/50 transition-colors hover:text-cyan-300"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
          </section>
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
                <span aria-hidden="true" className="text-white/20">/</span>
                <a href="tel:+261322546911" className="transition-colors hover:text-white">
                  +261 32 25 469 11
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

export default LoginPage;
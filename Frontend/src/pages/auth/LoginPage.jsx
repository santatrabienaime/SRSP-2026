import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { landingPathFor } from '../../utils/landing.js';

export function LoginPage() {
  const { login } = useAuth();
  const { toastSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const id = identifiant.trim();
    if (!id || !password) {
      setError({ message: 'Veuillez renseigner votre identifiant et votre mot de passe.' });
      return;
    }
    setLoading(true);
    try {
      const profil = await login(id, password);
      toastSuccess('Connexion réussie.');
      // On conduit l'utilisateur vers l'interface qui le concerne, et non vers
      // la page demandée qui pourrait être hors de son périmètre (page vide,
      // redirection ou erreur).
      navigate(landingPathFor(profil, from), { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      {/* Halos animés en arrière-plan : ils donnent de la profondeur sans
          jamais distraire de la saisie. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary-600/25 blur-3xl motion-safe:animate-halo" />
        <div
          className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary-800/30 blur-3xl motion-safe:animate-halo"
          style={{ animationDelay: '-7s' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Emplacement réservé au logo officiel (armoiries / ministère).
            À remplacer par l'image réelle : <img src="/logo-republique.png" … /> */}
        <div className="mb-5 flex justify-center motion-safe:animate-ligne">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-base font-bold tracking-wider text-white backdrop-blur-md">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl ring-1 ring-white/20 motion-safe:animate-pulse"
              style={{ animationDuration: '3.2s' }}
            />
            SRSP
          </div>
        </div>

        <div className="motion-safe:animate-monte overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
          {/* En-tête officiel — sur fond blanc, comme sur un document
              administratif. Sur le dégradé, ce texte en 11 px aurait eu un
              contraste insuffisant. */}
          <header className="px-6 pb-6 pt-7 text-center sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 sm:text-[11px] motion-safe:animate-ligne">
              République de Madagascar
            </p>
            <p
              className="mt-1 text-[11px] italic text-slate-400 motion-safe:animate-ligne"
              style={{ animationDelay: '60ms' }}
            >
              Fitiavana &mdash; Tanindrazana &mdash; Fandrosoana
            </p>

            {/* Double filet, séparateur de l'en-tête administratif. Il s'écarte
                depuis le centre : le trait se « trace » à l'arrivée. */}
            <div
              aria-hidden="true"
              className="mx-auto my-5 max-w-[15rem] space-y-[3px] motion-safe:animate-ligne"
              style={{ animationDelay: '120ms' }}
            >
              <div className="h-px w-full origin-left scale-x-0 bg-slate-300 motion-safe:animate-[monte_.6s_.2s_cubic-bezier(.22,1,.36,1)_forwards]" />
              <div className="h-px w-full origin-right scale-x-0 bg-slate-300 motion-safe:animate-[monte_.6s_.25s_cubic-bezier(.22,1,.36,1)_forwards]" />
            </div>

            <p
              className="text-[13px] font-bold uppercase tracking-wide text-slate-800 motion-safe:animate-ligne"
              style={{ animationDelay: '180ms' }}
            >
              Ministère de l&apos;Économie et des Finances
            </p>
            <p
              className="mx-auto mt-1.5 max-w-xs text-sm font-semibold leading-snug text-primary-700 motion-safe:animate-ligne"
              style={{ animationDelay: '240ms' }}
            >
              Service Régional de la Solde et des Pensions Fitovinany
            </p>
          </header>

          <div className="px-6 pb-7 pt-6 sm:px-8">
            <div className="mb-5 text-center">
              <h1 className="text-base font-semibold text-slate-800">
                Connexion à la plateforme
              </h1>
              <p className="mt-1 text-[11px] text-slate-500">
                Suivi et traçabilité des dossiers administratifs
              </p>
            </div>

            {/* role=alert : le message est lu par les lecteurs d'écran dès
                qu'il apparaît, ce que la carte d'erreur ne garantissait pas. */}
            <div role="alert" aria-live="assertive">
              {error && (
                <div className="mb-4 motion-safe:animate-secousse">
                  <Alert type="error" title="Connexion impossible">
                    {error.message}
                  </Alert>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Identifiant ou email"
                required
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="ex. admin@srsp.mg"
              />
              <Input
                label="Mot de passe"
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                <LogIn className="h-4 w-4" /> Se connecter
              </Button>
            </form>

            <div className="mt-5 text-center">
              <Link
                to="/mot-de-passe-oublie"
                className="text-xs font-medium text-primary-700 transition-colors hover:text-primary-800 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>
        </div>

        {/* Pied de page : les coordonnées du service. Un utilisateur qui
            échoue à se connecter a besoin de pouvoir appeler le service — il ne
            fallait donc pas les enfermer dans la carte, au-dessus du
            formulaire. */}
        <footer className="mt-7 space-y-2.5 text-center text-[11px] text-slate-400">
          <address className="not-italic">
            <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                Ambodiaplay, Manakara
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <a href="tel:+261321109010" className="transition-colors hover:text-white">
                  +261 32 11 090 10
                </a>
                <span aria-hidden="true" className="text-slate-600">/</span>
                <a href="tel:+261322546911" className="transition-colors hover:text-white">
                  +261 32 25 469 11
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <a
                  href="mailto:srsp.fitovinany@dgfag.mg"
                  className="font-medium transition-colors hover:text-white"
                >
                  srsp.fitovinany@dgfag.mg
                </a>
              </span>
            </p>
          </address>
          <p className="text-slate-500">
            Plateforme interne — accès réservé au personnel autorisé du SRSP.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default LoginPage;
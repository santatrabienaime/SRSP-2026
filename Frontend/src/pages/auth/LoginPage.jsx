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

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!identifiant || !password) {
      setError({ message: 'Veuillez renseigner votre identifiant et votre mot de passe.' });
      return;
    }
    setLoading(true);
    try {
      const profil = await login(identifiant, password);
      toastSuccess('Connexion réussie.');
      // On conduit l'utilisateur vers l'interface qui le concerne, et non vers
      // la page demandée qui pourrait être hors de son périmètre (page vide,
      // redirection ou erreur).
      navigate(landingPathFor(profil || { role_nom: profil?.role_nom }), {
        replace: true,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-800 via-primary-900 to-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Emplacement réservé au logo officiel (armoiries / ministère).
            À remplacer par l'image réelle : <img src="/logo-republique.png" … /> */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-bold tracking-wider text-white backdrop-blur">
            SRSP
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
          {/* En-tête officiel — sur fond blanc, comme sur un document
              administratif. Sur le dégradé, ce texte en 11 px aurait eu un
              contraste insuffisant. */}
          <header className="px-6 pb-5 pt-6 text-center sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 sm:text-[11px]">
              République de Madagascar
            </p>
            <p className="mt-1 text-[11px] italic text-slate-400">
              Fitiavana &mdash; Tanindrazana &mdash; Fandrosoana
            </p>

            {/* Double filet, séparateur de l'en-tête administratif */}
            <div className="mx-auto my-4 max-w-[15rem] border-t border-slate-300" />
            <div className="mx-auto -mt-3.5 max-w-[15rem] border-t border-slate-300" />

            <p className="mt-3 text-[13px] font-bold uppercase tracking-wide text-slate-800">
              Ministère de l&apos;Économie et des Finances
            </p>
            <p className="mx-auto mt-1.5 max-w-xs text-sm font-semibold leading-snug text-primary-700">
              Service Régional de la Solde et des Pensions Fitovinany
            </p>
          </header>

          {/* Coordonnées du service */}
          <address className="not-italic">
            <div className="space-y-1.5 border-y border-slate-100 bg-slate-50/80 px-6 py-4 text-[11px] text-slate-600 sm:px-8">
              <p className="flex items-center justify-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                Ambodiaplay, Manakara
              </p>
              <p className="flex items-center justify-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                +261 32 11 090 10 / +261 32 25 469 11
              </p>
              <p className="flex items-center justify-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <a
                  href="mailto:srsp.fitovinany@dgfag.mg"
                  className="font-medium text-primary-700 hover:underline"
                >
                  srsp.fitovinany@dgfag.mg
                </a>
              </p>
            </div>
          </address>

          <div className="px-6 py-6 sm:px-8">
            <div className="mb-5 text-center">
              <h1 className="text-base font-semibold text-slate-800">
                Connexion à la plateforme
              </h1>
              <p className="mt-1 text-[11px] text-slate-500">
                Suivi et traçabilité des dossiers administratifs
              </p>
            </div>

          {error && (
            <Alert type="error" title="Connexion impossible">
              {error.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Identifiant ou email"
              required
              autoComplete="username"
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
                className="text-xs font-medium text-primary-700 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400">
          Plateforme interne — accès réservé au personnel autorisé du SRSP.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
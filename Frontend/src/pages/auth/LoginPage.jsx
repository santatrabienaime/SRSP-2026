import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-4 py-8">
      <div className="w-full max-w-md">
        {/* En-tête officiel : l'identité administrative du service, affichée
            avant l'écran de connexion. Il remplace un ancien bloc qui portait un
            simple « S » — jamais un logo réel. */}
        <header className="mb-6 text-center text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]">
            République de Madagascar
          </p>
          <p className="mt-1 text-[11px] italic text-primary-100">
            Fitiavana &mdash; Tanindrazana &mdash; Fandrosoana
          </p>

          <div className="mx-auto my-3 h-px w-24 bg-white/40" />

          <p className="text-sm font-bold uppercase tracking-wide">
            Ministère de l&apos;Économie et des Finances
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug">
            Service Régional de la Solde et des Pensions Fitovinany
          </p>
        </header>

        <div className="rounded-xl bg-white p-6 shadow-xl">
          {/* Coordonnées du service : sous l'en-tête, comme sur un document
              administratif. */}
          <address className="mb-4 border-b border-slate-200 pb-4 text-center text-[11px] not-italic leading-relaxed text-slate-500">
            Ambodiaplay, Manakara
            <br />
            +261 32 11 090 10 / +261 32 25 469 11
            <br />
            <a
              href="mailto:srsp.fitovinany@dgfag.mg"
              className="text-primary-600 hover:underline"
            >
              srsp.fitovinany@dgfag.mg
            </a>
          </address>

          <p className="mb-4 text-center text-xs text-slate-500">
            Suivi et traçabilité des dossiers administratifs
          </p>

          <div className="mb-4 flex items-center gap-2 text-slate-700">
            <ShieldCheck className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Connexion</h2>
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

          <div className="mt-4 text-center">
            <Link to="/mot-de-passe-oublie" className="text-xs text-primary-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-primary-100">
          Plateforme interne — accès réservé au personnel autorisé du SRSP.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
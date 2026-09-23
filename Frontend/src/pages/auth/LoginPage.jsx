import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

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
      await login(identifiant, password);
      toastSuccess('Connexion réussie.');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-3xl font-bold backdrop-blur">
            S
          </div>
          <h1 className="text-2xl font-bold">SRSP Fitovinany</h1>
          <p className="mt-1 text-sm text-primary-100">
            Suivi et traçabilité des dossiers administratifs
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-xl">
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
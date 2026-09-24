import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';

/** Page d'aide en cas de mot de passe oublié. */
export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-2 text-slate-700">
          <KeyRound className="h-5 w-5 text-primary-600" />
          <h1 className="text-lg font-semibold">Mot de passe oublié</h1>
        </div>
        <p className="text-sm text-slate-600">
          La réinitialisation du mot de passe est effectuée par l'administrateur du SRSP.
          Contactez l'administrateur système pour obtenir un nouveau mot de passe.
        </p>
        <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
          Pour votre sécurité, aucun identifiant ni mot de passe n'est affiché sur
          cette page. En cas de compte verrouillé, contactez l'administrateur : il
          peut le déverrouiller depuis l'espace d'administration.
        </p>
        <Link to="/login" className="mt-5 block">
          <Button variant="secondary" className="w-full">
            <ArrowLeft className="h-4 w-4" /> Retour à la connexion
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
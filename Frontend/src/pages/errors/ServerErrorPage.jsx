import { Link } from 'react-router-dom';
import { ServerCrash } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';

export function ServerErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 text-center">
      <ServerCrash className="h-16 w-16 text-amber-300" />
      <h1 className="mt-4 text-4xl font-bold text-slate-700">500</h1>
      <p className="mt-2 text-slate-500">
        Une erreur interne est survenue. Réessayez plus tard.
      </p>
      <Link to="/" className="mt-6">
        <Button>Retour au tableau de bord</Button>
      </Link>
    </div>
  );
}

export default ServerErrorPage;
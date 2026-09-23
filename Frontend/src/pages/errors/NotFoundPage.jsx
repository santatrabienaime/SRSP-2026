import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 text-center">
      <FileQuestion className="h-16 w-16 text-slate-300" />
      <h1 className="mt-4 text-4xl font-bold text-slate-700">404</h1>
      <p className="mt-2 text-slate-500">La page demandée est introuvable.</p>
      <Link to="/" className="mt-6">
        <Button>Retour au tableau de bord</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
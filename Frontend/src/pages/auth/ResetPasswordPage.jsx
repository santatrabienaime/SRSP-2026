import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Alert } from '../../components/ui/Alert.jsx';

/**
 * Page sans correspondance (la réinitialisation se fait par l'admin).
 * Conservée pour la cohérence des routes /mot-de-passe-oublie/*.
 */
export function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <Alert type="info" title="Réinitialisation du mot de passe">
          La réinitialisation s'effectue via l'espace d'administration
          (profil → utilisateurs). Aucun lien externe n'est disponible.
        </Alert>
        <Link to="/login" className="mt-5 flex items-center justify-center gap-1 text-sm text-primary-600 hover:underline">
          <ShieldAlert className="h-4 w-4" /> Retour à la connexion
        </Link>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
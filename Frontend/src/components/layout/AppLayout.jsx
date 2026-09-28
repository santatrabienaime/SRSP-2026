import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { Footer } from './Footer.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useUI } from '../../contexts/UIContext.jsx';
import { IdleSessionGuard } from '../../hooks/useIdleSession.jsx';

/**
 * Gabarit principal des pages authentifiées.
 *
 * L'Outlet porte une clé liée à l'utilisateur : au changement de session
 * (déconnexion puis connexion d'un autre compte), React démonte et remonte
 * la page. Sans cela, la nouvelle page pouvait brièvement afficher les données
 * et les filtres saisis par l'utilisateur précédent.
 */
export function AppLayout() {
  const { user } = useAuth();
  const { barreRepliee } = useUI();
  const navigate = useNavigate();
  const userId = user?.id ?? 'anon';

  // Un changement de compte renvoie à l'accueil : on ne reste pas sur une page
  // construite pour le rôle précédent.
  useEffect(() => {
    if (userId !== 'anon') navigate('/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      {/* La marge suit la largeur réelle de la barre, repliée ou non. La
          transition évite que le contenu saute d'un coup. */}
      <div
        className={`transition-[padding] duration-300 ease-out motion-reduce:transition-none ${
          barreRepliee ? 'pl-[4.5rem]' : 'pl-64'
        }`}
      >
        <Topbar />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet key={userId} />
        </main>
        <Footer />
      </div>
      {/* Deconnexion automatique apres inactivite, avec avertissement. */}
      <IdleSessionGuard />
    </div>
  );
}

export default AppLayout;

/**
 * PageLoader — Écran de chargement animé affiché lors de la navigation
 * entre les pages principales. Évite l'écran blanc pendant le rendu.
 */
import { useEffect, useState } from 'react';
import { FolderKanban } from 'lucide-react';

export function PageLoader({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center animate-spin-slow shadow-lg shadow-blue-500/40">
            <FolderKanban className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
            Chargement de SRSP Fitovinany…
          </p>
          <div className="w-64 h-1 bg-blue-100 rounded-full mt-4 overflow-hidden dark:bg-slate-700">
            <div className="h-full bg-blue-600 rounded-full animate-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default PageLoader;
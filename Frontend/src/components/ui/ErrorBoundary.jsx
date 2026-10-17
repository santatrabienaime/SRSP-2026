import { Component, createElement } from 'react';

/**
 * ErrorBoundary : capture les erreurs de rendu dans ses enfants et affiche
 * un message explicite au lieu d'un écran blanc. Utile en production pour
 * diagnostiquer un composant qui plante (accès à une propriété sur undefined,
 * composant enfant manquant, etc.).
 */
export class ErrorBoundary extends Component {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Erreur de rendu capturée :', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (fallback) return createElement(fallback);
      return (
        <div className="p-6 max-w-md mx-auto bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-semibold mb-2">Erreur de rendu</h2>
          <p className="text-red-700 text-sm">
            {this.state.error?.message || 'Une erreur inattendue est survenue.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

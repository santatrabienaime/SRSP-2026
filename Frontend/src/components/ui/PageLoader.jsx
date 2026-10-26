/**
 * PageLoader - conserve pour compatibilite, ne retarde plus rien.
 * Les etats de chargement vivent dans les pages (useApi, Spinner).
 */
export function PageLoader({ children }) {
  return <>{children}</>;
}

export default PageLoader;
/**
 * PageLoader - conservÃ© pour compatibilitÃ©, ne retarde plus rien.
 * Les Ã©tats de chargement vivent dans les pages (useApi, Spinner).
 */
export function PageLoader({ children }) {
  return <>{children}</>;
}

export default PageLoader;
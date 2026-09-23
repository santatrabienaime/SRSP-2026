export function errorMiddleware(err, req, res, next) {
  const isValidation = err.name === 'ValidationError';
  const isDup = err.code === 'ER_DUP_ENTRY';
  const isExtension = err.message && /extension/i.test(err.message);

  const status =
    err.status || err.statusCode || (isValidation ? 400 : isDup ? 409 : isExtension ? 400 : 500);
  const message = err.message || 'Erreur interne du serveur.';

  // Les 4xx sont des refus métier normaux (warning) ; seuls les 5xx sont des erreurs serveur.
  if (status >= 500) {
    console.error('❌ Erreur serveur :', message, err.stack?.split('\n').slice(0, 3).join('\n'));
  } else {
    console.warn(`⚠️ HTTP ${status} : ${message}`);
  }

  res.status(status).json({ message });
}
import { messageTropGros } from '../config/multer.js';

export function errorMiddleware(err, req, res, next) {
  const isValidation = err.name === 'ValidationError';
  const isDup = err.code === 'ER_DUP_ENTRY';
  const isExtension = err.message && /extension/i.test(err.message);

  /* Une pièce trop lourde n'est pas une panne du serveur : c'est un refus de la
     requête, au même titre qu'une extension interdite. Sans ce cas, multer lève
     une MulterError sans code HTTP, et le fichier de 6 Mo repartait en 500
     « File too large ». Un 500 se lit comme une défaillance de la plateforme et
     fait croire à l'agent que son dépôt a échoué pour une raison inconnue,
     alors que la règle des 5 Mo est connue et appliquée partout ailleurs.

     Le message vient de la même fonction que celui du middleware d'upload : le
     refus est le même, il doit donc se lire de la même façon. */
  const TROP_GROS = {
    'LIMIT_FILE_SIZE': messageTropGros(),
    'LIMIT_FILE_COUNT': 'Trop de pièces dans cette requête.',
    'LIMIT_UNEXPECTED_FILE': 'Champ de fichier inattendu.',
  };
  const limiteMulter = TROP_GROS[err.code];

  const status =
    err.status || err.statusCode
    || (isValidation ? 400
      : isDup ? 409
        : isExtension ? 400
          : limiteMulter ? 413
            : 500);
  const message = limiteMulter || err.message || 'Erreur interne du serveur.';

  // Les 4xx sont des refus métier normaux (warning) ; seuls les 5xx sont des erreurs serveur.
  if (status >= 500) {
    console.error('❌ Erreur serveur :', message, err.stack?.split('\n').slice(0, 3).join('\n'));
  } else {
    console.warn(`⚠️ HTTP ${status} : ${message}`);
  }

  res.status(status).json({ message });
}

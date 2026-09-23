import rateLimit from 'express-rate-limit';

/*
 * Limitation de débit (HTTP 429).
 * - Désactivée par défaut en développement (dev : pas de blocage durant les tests).
 * - Activable/paramétrable via l'environnement :
 *     RATE_LIMIT_ENABLED=true|false   (défaut : activé hors développement)
 *     RATE_LIMIT_MAX=200              (requêtes par fenêtre)
 *     RATE_LIMIT_WINDOW_MS=900000     (fenêtre en millisecondes)
 */
const enabled =
  process.env.RATE_LIMIT_ENABLED !== undefined
    ? process.env.RATE_LIMIT_ENABLED === 'true'
    : process.env.NODE_ENV !== 'development';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const max = parseInt(process.env.RATE_LIMIT_MAX, 10) || 200;

export const rateLimiter = enabled
  ? rateLimit({
      windowMs,
      max,
      message: { message: 'Trop de requêtes, veuillez réessayer plus tard.' },
      standardHeaders: true,
      legacyHeaders: false,
    })
  : (req, res, next) => next();
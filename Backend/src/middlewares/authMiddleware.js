import jwt from 'jsonwebtoken';
import { verifierSession } from '../utils/sessionCache.js';

/**
 * Authentification par jeton.
 *
 * La signature du jeton prouve seulement qu'il a été émis par le serveur et
 * qu'il n'a pas été modifié. Elle ne dit rien de l'état du compte *depuis*
 * l'émission. Sans vérification complémentaire, deux événements rendent le
 * contrôle des permissions inopérant :
 *
 *   - la **désactivation** d'un compte : la personne ne peut plus se
 *     connecter, mais ses sessions ouvertes continuent de fonctionner jusqu'à
 *     l'expiration du jeton ;
 *   - la **réinitialisation** d'un mot de passe : le mot de passe change,
 *     mais les sessions ouvertes survivent — un jeton volé resterait
 *     valable alors même que son auteur vient de prouver qu'il a perdu la
 *     maîtrise de son compte.
 *
 * Le contrôle est fait sur TOUTE requête authentifiée, et pas seulement sur
 * les écritures : un dossier affiché après la désactivation d'un compte
 * continuerait d'être consultable, et il faut que la réponse soit la même
 * partout — « cette session n'est plus valable ».
 *
 * Le contrôle lui-même est dans `utils/sessionCache.js` : il est mis en cache
 * pour ne pas coûter une lecture de base à chaque requête, et il est
 * partagé avec le canal temps réel, qui doit appliquer la même règle.
 */
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
  }
  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }

  try {
    const probleme = await verifierSession(decoded);
    if (probleme) {
      return res.status(401).json({ message: probleme });
    }
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}

export { verifierSession } from '../utils/sessionCache.js';

export default authMiddleware;

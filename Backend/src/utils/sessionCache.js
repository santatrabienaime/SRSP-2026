import db from '../config/db.js';

/**
 * État d'un compte, mis en cache.
 *
 * Chaque requête authentifiée doit savoir si le compte est encore actif et
 * si son mot de passe a changé depuis l'émission du jeton. Interroger la base
 * à chaque appel coûterait une lecture de `users` par requête — une page de
 * l'application en déclenche une dizaine.
 *
 * Le cache est donc utilisé, avec une durée de vie courte : dix secondes.
 * C'est le compromis entre deux exigences :
 *   - une désactivation doit prendre effet **rapidement** (« désactivation
 *     rapide » fait partie des règles de sécurité) ;
 *   - la base ne doit pas être sollicitée en continu.
 *
 * Une action qui change l'état d'un compte — changement de mot de passe,
 * réinitialisation, désactivation — **vide l'entrée immédiatement** : là, aucun
 * décalage n'est tolérable, puisque c'est précisément l'action qui doit
 * prendre effet tout de suite.
 *
 * Le cache vit dans le processus. En cas de déploiement sur plusieurs
 * instances, chaque instance a le sien : le décalage maximal reste borné
 * par la durée de vie.
 */

/** Durée de vie d'une entrée, en millisecondes. */
const TTL = Number(process.env.SESSION_CACHE_TTL || 10000);

/** `userId → { at, actif, mdpChange }`. */
const cache = new Map();

/**
 * Vide l'entrée d'un compte — ou toutes les entrées.
 *
 * À appeler après toute écriture qui change l'état d'un compte.
 */
export function invaliderCacheSession(userId) {
  if (userId === undefined || userId === null) {
    cache.clear();
    return;
  }
  cache.delete(Number(userId));
}

/**
 * État d'un compte : actif, et date du dernier changement de mot de passe.
 *
 * `mdpChange` est un horodatage epoch en **millisecondes**, calculé par
 * PostgreSQL en tenant compte du fuseau de la session : il est donc
 * directement comparable à l'instant d'émission d'un jeton, sans conversion
 * de fuseau horaire côté JavaScript — c'est la seule façon d'éviter qu'une
 * date lue en JavaScript et une date écrite en base se contredisent.
 *
 * La précision au millième est indispensable : `iat` du JWT est en
 * secondes, et un changement de mot de passe daté de la même seconde qu'une
 * connexion rendrait la comparaison ambiguë — un agent réinitialisé par un
 * administrateur, qui se connecte dans la même seconde, verrait sa session
 * refusée. Le jeton porte donc aussi `iatMs`, et c'est lui qui tranche.
 *
 * Renvoie `null` si le compte n'existe pas.
 */
export async function etatCompte(userId) {
  const maintenant = Date.now();
  const enCache = cache.get(Number(userId));
  if (enCache && maintenant - enCache.at < TTL) return enCache;

  const rows = await db.query(
    `SELECT u.actif,
            (EXTRACT(EPOCH FROM (u.mot_de_passe_change_le AT TIME ZONE current_setting('TimeZone'))) * 1000)::bigint AS mdp_change_ms
     FROM users u
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );
  const ligne = rows[0];
  if (!ligne) {
    cache.delete(Number(userId));
    return null;
  }

  const etat = {
    at: maintenant,
    actif: Boolean(ligne.actif),
    mdpChange: ligne.mdp_change_ms === null ? null : Math.round(Number(ligne.mdp_change_ms)),
  };
  cache.set(Number(userId), etat);
  return etat;
}

/**
 * Vérifie qu'un jeton correspond encore à un compte utilisable.
 *
 * Renvoie un message prêt à être renvoyé, ou `null` si la session est bonne.
 */
export async function verifierSession(decoded) {
  const { id, iat, iatMs } = decoded || {};
  if (!id) return 'Session invalide.';

  const compte = await etatCompte(id);
  if (!compte) return 'Session invalide.';
  if (!compte.actif) {
    return 'Ce compte a été désactivé. La session a été fermée.';
  }

  if (compte.mdpChange !== null) {
    /* `iatMs` est l'instant exact d'émission, au millième. Les jetons émis
       avant son introduction n'en portent pas : on retombe alors sur `iat`,
       à la seconde près — ces jetons sont de toute façon antérieurs. */
    const emis = Number.isFinite(Number(iatMs)) ? Number(iatMs) : Number(iat) * 1000;
    if (emis < compte.mdpChange) {
      return 'Le mot de passe a été modifié depuis l’ouverture de cette session. Reconnectez-vous.';
    }
  }
  return null;
}

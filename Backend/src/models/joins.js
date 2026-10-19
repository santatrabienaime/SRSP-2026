/**
 * Fragments de jointure partagés par les requêtes qui relient un compte de
 * connexion (`users`) à la fiche de la personne (`agents`).
 *
 * `agents.user_id` n'est pas unique en base : un compte a déjà pu porter
 * plusieurs fiches. Or la division, le nom et la fonction de la personne sont
 * lus partout à travers cette jointure — la connexion (`/me`), le périmètre des
 * dossiers, le filtre du journal d'audit. Avec deux fiches, la ligne retenue
 * était celle que le moteur trouvait en premier : le périmètre d'un compte
 * pouvait donc être vide alors que sa fiche portait une division, et chaque
 * geste apparaissait deux fois dans le journal.
 *
 * La règle « une seule fiche par compte » est appliquée par
 * `personnelService` à chaque écriture ; cette jointure la rend vraie même sur
 * des données plus anciennes, en ne retenant que la fiche la plus récente.
 *
 * Les requêtes qui utilisent ce fragment doivent conserver les alias `u`
 * (users) et `a` (agents).
 */
export const FICHE_DU_COMPTE =
  'LEFT JOIN agents a ON a.id = (SELECT MAX(a2.id) FROM agents a2 WHERE a2.user_id = u.id)';

import db from '../config/db.js';

/**
 * Journal des actions.
 *
 * Règle d'or du document : « aucune action sans agent, sans date, sans heure ».
 * Deuxlässages sont donc rendus impossibles par la base, pas seulement évités
 * par le code applicatif :
 *
 *   - `user_id` reste nullable, mais uniquement parce qu'un échec de connexion
 *     n'a pas d'auteur : personne ne s'identifie quand l'identification échoue.
 *     Toute autre action doit porter un auteur.
 *   - `date_action` porte l'horodatage complet. L'heure seule n'est pas une
 *     information d'audit : deux actions dans la même minute sont indiscernables.
 */

/** Types d'actions sans auteur possible, et la raison. */
export const ACTIONS_SANS_AUTEUR = {
  CONNEXION_ECHOUEE:
    "Échec d'identification : aucun compte ne s'est identifié, l'événement est donc sans auteur",
};

export async function log({ user_id, action, dossier_id, ancienne_valeur, nouvelle_valeur, details, ip_address }) {
  await db.query(
    `INSERT INTO historique_actions (user_id, action, dossier_id, ancienne_valeur, nouvelle_valeur, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id || null, action, dossier_id || null, ancienne_valeur || null, nouvelle_valeur || null,
     details || null, ip_address || null]
  );
}

/**
 * Actions d'un dossier, ou de l'ensemble du journal.
 *
 * Chaque ligne est enrichie du VRAI nom de l'agent et de son rôle. La table
 * `users` ne porte qu'un identifiant de connexion (`chef.visa`) : afficher cela
 * comme identité d'agent ne permet pas de savoir qui a agi. La table `agents`
 * porte le nom, le prénom et la fonction, et se relie à `users` par `user_id`.
 */
export async function findAll(filters = {}) {
  let query = `
    SELECT h.id, h.action, h.dossier_id, h.details, h.ip_address, h.date_action,
           h.ancienne_valeur, h.nouvelle_valeur,
           d.numero AS dossier_numero,
           u.username,
           a.nom AS agent_nom, a.prenom AS agent_prenom,
           r.nom AS role_code, r.description AS role_description
    FROM historique_actions h
    LEFT JOIN users u ON h.user_id = u.id
    LEFT JOIN agents a ON a.user_id = u.id
    LEFT JOIN roles r ON r.id = u.role_id
    LEFT JOIN dossiers d ON h.dossier_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.dossier_id) { query += ' AND h.dossier_id = ?'; params.push(filters.dossier_id); }
  if (filters.action) { query += ' AND h.action = ?'; params.push(filters.action); }
  if (filters.date_debut) { query += ' AND h.date_action >= ?'; params.push(filters.date_debut); }
  if (filters.date_fin) {
    /* Borne haute jusqu'au soir inclus : un `date_fin` à 29/09/00:00 exclurait
       par construction toutes les actions de la journée même. */
    query += ' AND h.date_action < DATE_ADD(?, INTERVAL 1 DAY)';
    params.push(filters.date_fin);
  }
  // Filtre de division. Posé par le service à partir du périmètre de
  // l'utilisateur, jamais lu depuis la requête HTTP : le client ne doit pas
  // pouvoir l'élargir, seulement le service le restreint.
  if (filters.division_id) {
    query += ' AND d.division_id = ?';
    params.push(Number(filters.division_id));
  }
  // Filtrage par agent sur l'IDENTITÉ RÉELLE, pas sur l'identifiant technique :
  // « RAKOTO » doit retrouver les dossiers de cette personne, quel que soit
  // l'identifiant de connexion qu'elle utilise.
  if (filters.agent_id) { query += ' AND a.id = ?'; params.push(Number(filters.agent_id)); }
  if (filters.user_id) { query += ' AND h.user_id = ?'; params.push(Number(filters.user_id)); }
  if (filters.search) {
    const motif = `%${String(filters.search).trim()}%`;
    query += ` AND (d.numero LIKE ? OR a.nom LIKE ? OR a.prenom LIKE ?
                    OR u.username LIKE ? OR h.details LIKE ? OR h.action LIKE ?)`;
    params.push(motif, motif, motif, motif, motif, motif);
  }

  // Un journal d'audit se parcourt du plus récent au plus ancien, et on veut
  // la dernière action en premier : c'est ce que cherche un lecteur.
  query += ' ORDER BY h.date_action DESC, h.id DESC';

  const limit = Math.min(Math.max(Number(filters.limit) || 500, 1), 5000);
  query += ' LIMIT ?';
  params.push(limit);

  const lignes = await db.query(query, params);

  /* Un compteur global, calculé hors de la limite : sans lui, un journal
     tronqué afficherait un total igual au nombre de lignes rapportées, et
     l'utilisateur croirait avoir tout vu. */
  let countQuery = `
    SELECT COUNT(*) AS total
    FROM historique_actions h
    LEFT JOIN users u ON h.user_id = u.id
    LEFT JOIN agents a ON a.user_id = u.id
    LEFT JOIN dossiers d ON h.dossier_id = d.id
    WHERE 1=1
  `;
  const countParams = [];
  if (filters.dossier_id) { countQuery += ' AND h.dossier_id = ?'; countParams.push(filters.dossier_id); }
  if (filters.action) { countQuery += ' AND h.action = ?'; countParams.push(filters.action); }
  if (filters.date_debut) { countQuery += ' AND h.date_action >= ?'; countParams.push(filters.date_debut); }
  if (filters.date_fin) { countQuery += ' AND h.date_action < DATE_ADD(?, INTERVAL 1 DAY)'; countParams.push(filters.date_fin); }
  if (filters.division_id) { countQuery += ' AND d.division_id = ?'; countParams.push(Number(filters.division_id)); }
  if (filters.agent_id) { countQuery += ' AND a.id = ?'; countParams.push(Number(filters.agent_id)); }
  if (filters.user_id) { countQuery += ' AND h.user_id = ?'; countParams.push(Number(filters.user_id)); }
  if (filters.search) {
    const motif = `%${String(filters.search).trim()}%`;
    countQuery += ` AND (d.numero LIKE ? OR a.nom LIKE ? OR a.prenom LIKE ?
                          OR u.username LIKE ? OR h.details LIKE ? OR h.action LIKE ?)`;
    countParams.push(motif, motif, motif, motif, motif, motif);
  }
  const [compte] = await db.query(countQuery, countParams);

  /* Nombre d'événements du JOURNAL filtré qui n'ont pas d'auteur identifié.
     Compté ici, sur la même requête et les mêmes filtres, et non dans la page
     renvoyée : l'écran affichait « aucun événement sans auteur » alors que le
     journal en comptait 14, simplement parce qu'ils étaient au-delà de la page
     affichée. Un avertissement calculé sur une tranche alors qu'il parle du
     tout ne peut être que faux — ici par omission, demain par excès. */
  countQuery = countQuery.replace(
    'SELECT COUNT(*) AS total',
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN a.id IS NULL THEN 1 ELSE 0 END) AS sans_auteur`
  );
  const [compteComplet] = await db.query(countQuery, countParams);

  return {
    lignes,
    total: compteComplet?.total ?? compte?.total ?? 0,
    sans_auteur: Number(compteComplet?.sans_auteur || 0),
    tronque: (compteComplet?.total ?? 0) > lignes.length,
  };
}

/**
 * Types d'actions rencontrés, pour alimenter les listes de filtrage.
 * Le client ne propose que ce qui existe réellement dans le journal.
 */
export async function findActions() {
  const lignes = await db.query(
    `SELECT action, COUNT(*) AS total
     FROM historique_actions
     GROUP BY action
     ORDER BY total DESC, action ASC`
  );
  return lignes;
}

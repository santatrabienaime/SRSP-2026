import db from '../config/db.js';
import { filterFor } from './scopeService.js';

/**
 * Indicateurs de performance du service.
 *
 * Ce module existait, mais n'avait jamais fonctionné : ses requêtes
 * portaient sur des colonnes que la table `dossiers` n'a pas
 * (`statut_code`, `date_creation`, `agent_id`), une de ses méthodes était
 * définie deux fois, et le contrôleur appelait un service qu'il n'importait
 * pas. Aucun écran ne l'utilisait — ce qui explains pourquoi personne ne
 * l'avait vu.
 *
 * Il est reconstruit sur le **schéma réel** et, surtout, il applique le
 * **périmètre** de l'utilisateur comme le tableau de bord. Sans cela, un
 * chargé de secours pouvait interroger la performance de toutes les divisions
 * et de tous les agents : le cloisonnement se faisait à l'écran, mais pas
 * sur les données.
 *
 * Aucun calcul de délai réglementaire n'est inventé : le délai moyen est
 * l'écart entre la réception et la clôture, tel qu'il est constate.
 */

/* Les statuts du circuit, dans l'ordre où le dossier les traverse. */
const STATUTS = {
  enCours: 'EN_TRAITEMENT',
  enAttente: 'EN_ATTENTE_COMPLEMENT',
  aCorriger: 'CORRECTION_DEMANDEE',
  cloture: 'CLOTURE',
  archive: 'ARCHIVE',
};

/**
 * Indicateurs globaux.
 */
export async function getStats(scope) {
  const f = await filterFor(scope);

  const [stats] = await db.query(
    `SELECT
       COUNT(d.id) AS total_dossiers,
       SUM(CASE WHEN s.code = '${STATUTS.cloture}' THEN 1 ELSE 0 END) AS dossiers_clotures,
       SUM(CASE WHEN s.code = '${STATUTS.archive}' THEN 1 ELSE 0 END) AS dossiers_archives,
       SUM(CASE WHEN s.code = '${STATUTS.enCours}' THEN 1 ELSE 0 END) AS dossiers_en_cours,
       SUM(CASE WHEN s.code = '${STATUTS.enAttente}' THEN 1 ELSE 0 END) AS dossiers_en_attente,
       SUM(CASE WHEN s.code = '${STATUTS.aCorriger}' THEN 1 ELSE 0 END) AS dossiers_a_corriger,
       AVG(CASE WHEN d.date_cloture IS NOT NULL
                THEN DATEDIFF(d.date_cloture, d.date_reception) END) AS delai_moyen
     FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE 1=1${f.where}`,
    f.params
  );

  const total = Number(stats.total_dossiers || 0);
  const clotures = Number(stats.dossiers_clotures || 0);
  const archives = Number(stats.dossiers_archives || 0);

  return {
    total_dossiers: total,
    dossiers_clotures: clotures,
    dossiers_archives: archives,
    dossiers_en_cours: Number(stats.dossiers_en_cours || 0),
    dossiers_en_attente: Number(stats.dossiers_en_attente || 0),
    dossiers_a_corriger: Number(stats.dossiers_a_corriger || 0),
    delai_moyen_traitement: stats.delai_moyen
      ? Math.round(Number(stats.delai_moyen) * 100) / 100
      : null,
    /* Le taux de traitement compte ce qui est sorti du circuit : clôturé
       ou archivé. Un dossier en cours n'est pas un dossier traité. */
    taux_traitement: total > 0
      ? Math.round(((clotures + archives) / total) * 100 * 100) / 100
      : 0,
  };
}

/**
 * Les dossiers dont la date limite est dépassée.
 *
 * La date limite est une donnée saisie par l'agent ; le cahier ne fixe pas
 * de délai de traitement. L'indicateur mesure donc ce qui est en retard par
 * rapport à ce qui a été promis — et non par rapport à une norme inventée.
 */
export async function getEnRetard(scope) {
  const f = await filterFor(scope);

  const rows = await db.query(
    `SELECT d.id, d.numero, d.objet, d.date_limite,
            DATEDIFF(CURDATE(), d.date_limite) AS jours_retard,
            s.code AS statut_code, s.libelle AS statut_libelle,
            t.libelle AS type_libelle,
            dv.nom AS division_nom,
            a.nom AS agent_nom, a.prenom AS agent_prenom
     FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     LEFT JOIN types_dossiers t ON t.id = d.type_id
     LEFT JOIN divisions dv ON dv.id = d.division_id
     LEFT JOIN agents a ON a.id = d.agent_responsable_id
     WHERE d.date_limite IS NOT NULL
       AND d.date_limite < CURDATE()
       AND s.code NOT IN ('${STATUTS.cloture}', '${STATUTS.archive}')
       ${f.where}
     ORDER BY d.date_limite ASC`,
    f.params
  );

  return rows.map((r) => ({
    id: r.id,
    numero: r.numero,
    objet: r.objet,
    type: r.type_libelle,
    division: r.division_nom,
    agent: r.agent_nom ? `${r.agent_prenom} ${r.agent_nom}` : 'Non assigné',
    date_limite: r.date_limite,
    jours_retard: Number(r.jours_retard) || 0,
    statut: r.statut_code,
    statut_libelle: r.statut_libelle,
  }));
}

/**
 * Performance par division.
 */
export async function getParDivision(scope) {
  const f = await filterFor(scope);

  const rows = await db.query(
    `SELECT dv.nom AS division_nom,
            COUNT(d.id) AS total_dossiers,
            SUM(CASE WHEN s.code = '${STATUTS.cloture}' THEN 1 ELSE 0 END) AS clotures,
            SUM(CASE WHEN s.code = '${STATUTS.archive}' THEN 1 ELSE 0 END) AS archives,
            SUM(CASE WHEN s.code = '${STATUTS.enCours}' THEN 1 ELSE 0 END) AS en_cours,
            AVG(CASE WHEN d.date_cloture IS NOT NULL
                     THEN DATEDIFF(d.date_cloture, d.date_reception) END) AS delai_moyen
     FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     JOIN divisions dv ON dv.id = d.division_id
     WHERE 1=1${f.where}
     GROUP BY dv.id, dv.nom
     ORDER BY total_dossiers DESC`,
    f.params
  );

  return rows.map((r) => ({
    division: r.division_nom,
    total: Number(r.total_dossiers) || 0,
    clotures: Number(r.clotures) || 0,
    archives: Number(r.archives) || 0,
    en_cours: Number(r.en_cours) || 0,
    delai_moyen: r.delai_moyen ? Math.round(Number(r.delai_moyen) * 100) / 100 : null,
  }));
}

/**
 * Performance par agent.
 */
export async function getParAgent(scope) {
  const f = await filterFor(scope);

  const rows = await db.query(
    `SELECT a.id AS agent_id, a.nom AS agent_nom, a.prenom AS agent_prenom,
            dv.nom AS division_nom,
            COUNT(d.id) AS total_dossiers,
            SUM(CASE WHEN s.code = '${STATUTS.cloture}' THEN 1 ELSE 0 END) AS clotures,
            SUM(CASE WHEN s.code = '${STATUTS.archive}' THEN 1 ELSE 0 END) AS archives,
            AVG(CASE WHEN d.date_cloture IS NOT NULL
                     THEN DATEDIFF(d.date_cloture, d.date_reception) END) AS delai_moyen
     FROM agents a
     LEFT JOIN dossiers d ON d.agent_responsable_id = a.id
     LEFT JOIN statuts_dossiers s ON s.id = d.statut_id
     LEFT JOIN divisions dv ON dv.id = a.division_id
     WHERE 1=1${f.where}
     GROUP BY a.id, a.nom, a.prenom, dv.nom
     ORDER BY total_dossiers DESC`,
    f.params
  );

  return rows.map((r) => ({
    agent_id: r.agent_id,
    agent_nom: r.agent_nom,
    agent_prenom: r.agent_prenom,
    division: r.division_nom,
    total: Number(r.total_dossiers) || 0,
    clotures: Number(r.clotures) || 0,
    archives: Number(r.archives) || 0,
    delai_moyen: r.delai_moyen ? Math.round(Number(r.delai_moyen) * 100) / 100 : null,
  }));
}

/**
 * Évolution du volume des dossiers sur douze mois.
 */
export async function getEvolution(scope) {
  const f = await filterFor(scope);

  const rows = await db.query(
    `SELECT DATE_FORMAT(d.date_reception, '%Y-%m') AS mois,
            COUNT(*) AS total,
            SUM(CASE WHEN s.code IN ('${STATUTS.cloture}', '${STATUTS.archive}')
                     THEN 1 ELSE 0 END) AS clotures
     FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE d.date_reception >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       ${f.where}
     GROUP BY mois
     ORDER BY mois ASC`,
    f.params
  );

  return rows.map((r) => ({
    mois: r.mois,
    total: Number(r.total) || 0,
    clotures: Number(r.clotures) || 0,
  }));
}

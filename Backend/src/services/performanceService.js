import db from '../config/db.js';

/**
 * Service de performance du service.
 * Calcule les indicateurs de performance basés sur les données réelles des dossiers.
 */

export const performanceService = {
  /**
   * Récupère les indicateurs de performance globaux.
   */
  async getStats() {
    const [stats] = await db.query(`
      SELECT
        COUNT(*) as total_dossiers,
        SUM(CASE WHEN statut_code = 'ARCHIVE' THEN 1 ELSE 0 END) as dossiers_archives,
        SUM(CASE WHEN statut_code = 'CLOTURE' THEN 1 ELSE 0 END) as dossiers_clotures,
        SUM(CASE WHEN statut_code = 'EN_TRAITEMENT' THEN 1 ELSE 0 END) as dossiers_en_cours,
        SUM(CASE WHEN statut_code = 'EN_ATTENTE' THEN 1 ELSE 0 END) as dossiers_en_attente,
        SUM(CASE WHEN statut_code = 'REJETE' THEN 1 ELSE 0 END) as dossiers_rejetes,
        AVG(DATEDIFF(date_cloture, date_creation)) as delai_moyen_traitement
      FROM dossiers
    `);

    const statsData = stats[0];
    return {
      total_dossiers: statsStats.total_dossiers || 0,
      dossiers_archives: stats_stats.dossiers_archives || 0,
      dossiers_clotures: stats_stats.dossiers_clotures || 0,
      dossiers_en_cours: stats_stats.dossiers_en_cours || 0,
      dossiers_en_attente: stats_stats.dossiers_en_attente || 0,
      dossiers_rejetes: stats_stats.dossiers_rejetes || 0,
      delai_moyen_traitement: stats_stats.delai_moyen_traitement ? Math.round(stats_stats.delai_moyen_traitement * 100) / 100 : 0,
      taux_traitement: stats_stats.total_dossiers > 0
        ? Math.round(((stats_stats.dossiers_clotures || 0) / stats_stats.total_dossiers) * 100 * 100) / 100
        : 0
    };
  },

  /**
   * Récupère les dossiers en retard (dépassent la date limite).
   */
  async getEnRetard() {
    const rows = await db.query(`
      SELECT d.*, a.nom as agent_nom, a.prenom as agent_prenom, dv.nom as division_nom
      FROM dossiers d
      LEFT JOIN agents a ON a.id = d.agent_id
      LEFT JOIN divisions dv ON dv.id = d.division_id
      WHERE d.date_limite < CURRENT_DATE()
        AND d.statut_code NOT IN ('ARCHIVE', 'CLOTURE', 'REJETE')
      ORDER BY d.date_limite ASC
    `);
    return rows;
  },

  /**
   * Récupère les performances par division.
   */
  async getParDivision() {
    const rows = await db.query(`
      SELECT dv.nom as division_nom,
             COUNT(d.id) as total_dossiers,
             SUM(CASE WHEN d.statut_code = 'CLOTURE' THEN 1 ELSE 0 END) as clotures,
             SUM(CASE WHEN d.statut_code = 'ARCHIVE' THEN 1 ELSE 0 END) as archives,
             SUM(CASE WHEN d.statut_code = 'EN_TRAITEMENT' THEN 1 ELSE 0 END) as en_cours,
             AVG(DATEDIFF(d.date_cloture, d.date_creation)) as delai_moyen
      FROM dossiers d
      JOIN divisions dv ON dv.id = d.division_id
      GROUP BY dv.id, dv.nom
      ORDER BY total_dossiers DESC
    `);
    return rows.map(r => ({
      division: r.division_nom,
      total: parseInt(r.total_dossiers) || 0,
      clotures: parseInt(r.clotures) || 0,
      archives: parseInt(r.archives) || 0,
      en_cours: parseInt(r.en_cours) || 0,
      delai_moyen: r.delai_moyen ? Math.round(r.delai_moyen * 100) / 100 : 0
    }));
  },

  /**
   * Récupère les performances par agent.
   */
  async getParAgent() {
    const rows = await db.query(`
      SELECT a.nom as agent_nom, a.prenom as agent_prenom,
             dv.nom as division_nom,
             COUNT(d.id) as total_dossiers,
             SUM(CASE WHEN d.statut_code = 'CLOTURE' THEN 1 ELSE 0 END) as clotures,
             SUM(CASE WHEN d.statut_code = 'ARCHIVE' THEN 1 ELSE 0 END) as archives,
             AVG(DATEDIFF(d.date_cloture, d.date_creation)) as delai_moyen
      FROM agents a
      LEFT JOIN dossiers d ON d.agent_id = a.id
      LEFT JOIN divisions dv ON dv.id = a.division_id
      GROUP BY a.id, a.nom, a.prenom, dv.nom
      ORDER BY total_dossiers DESC
    `);
    return rows.map(r => ({
      agent_id: a.id,
      agent_nom: r.agent_nom,
      agent_prenom: r.agent_prenom,
      division: r.division_nom,
      total: parseInt(r.total_dossiers) || 0,
      clotures: parseInt(r.clotures) || 0,
      archives: parseInt(r.archives) || 0,
      delai_moyen: r.delai_moyen ? Math.round(r.delai_moyen * 100) / 100 : 0
    }));
  },

  /**
   * Récupère l'évolution des dossiers sur les 12 derniers mois.
   */
  async getEvolution() {
    const rows = await db.query(`
      SELECT DATE_FORMAT(date_creation, '%Y-%m') as mois,
             COUNT(*) as total,
             SUM(CASE WHEN statut_code = 'CLOTURE' THEN 1 ELSE 0 END) as clotures
      FROM dossiers
      WHERE date_creation >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(date_creation, '%Y-%m')
      ORDER BY mois ASC
    `);
    return rows.map(r => ({
      mois: r.mois,
      total: parseInt(r.total) || 0,
      clotures: parseInt(r.clotures) || 0
    }));
  },

  /**
   * Récupère les dossiers en retard (dépassent la date limite).
   */
  async getEnRetard() {
    const rows = await db.query(`
      SELECT d.*, a.nom as agent_nom, a.prenom as agent_prenom, dv.nom as division_nom,
             DATEDIFF(CURRENT_DATE(), d.date_limite) as jours_retard
      FROM dossiers d
      LEFT JOIN agents a ON a.id = d.agent_id
      LEFT JOIN divisions dv ON dv.id = d.division_id
      WHERE d.date_limite < CURRENT_DATE()
        AND d.statut_code NOT IN ('ARCHIVE', 'CLOTURE', 'REJETE')
      ORDER BY d.date_limite ASC
    `);
    return rows.map(r => ({
      id: r.id,
      numero: r.numero,
      objet: r.objet,
      type: r.type_libelle,
      division: r.division_nom,
      agent: r.agent_nom ? `${r.agent_prenom} ${r.agent_nom}` : 'Non assigné',
      date_limite: r.date_limite,
      jours_retard: parseInt(r.jours_retard) || 0,
      statut: r.statut_code
    }));
  }
};

export default performanceService;
import mysql from 'mysql2/promise';
import { config } from './env.js';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

export default {
  query: async (sql, params) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },
  /**
   * Exécute un traitement dans une transaction, sur UNE connexion.
   *
   * `db.query` passe par le pool : deux requêtes consécutives peuvent donc
   * partir sur deux connexions différentes, et une transaction ouverte sur
   * l'une ne voit pas les écritures de l'autre. Toute fonction qui reçoit une
   * connexion — les générateurs de numéro, par exemple — doit être appelée avec
   * celle-ci, sinon elle écrit en dehors de la transaction.
   *
   * L'intérêt est ici la numérotation : si l'écriture de l'acte échoue après
   * que le compteur a été incrémenté, le numéro est consommé sans acte au
   * registre. Un registre des actes chronologiques se lit précisément parce
   * qu'il est complet : un trou y ressemble à une pièce disparue, et il faut
   * pouvoir répondre à ce qui s'est passé.
   */
  withTransaction: async (traitement) => {
    const connexion = await pool.getConnection();
    try {
      await connexion.beginTransaction();
      const resultat = await traitement({ query: (sql, params) => connexion.execute(sql, params).then(([r]) => r) });
      await connexion.commit();
      return resultat;
    } catch (err) {
      await connexion.rollback();
      throw err;
    } finally {
      connexion.release();
    }
  },
  pool,
};
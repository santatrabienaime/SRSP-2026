import pg from 'pg';
import { config } from './env.js';

/**
 * Couche d'accès PostgreSQL.
 *
 * Le code métier utilise des placeholders `?`, des identifiants entre
 * backticks, et les résultats d'INSERT portent `insertId` et `affectedRows`.
 * On conserve cette interface et on la traduit vers `pg`. Les constructions
 * SQL propres à l'ancien moteur ont été réécrites dans les modèles.
 */

// Les BIGINT PostgreSQL sont convertis en nombre tant qu'ils restent dans la
// plage sûre ; les compteurs et identifiants de la plateforme le sont.
pg.types.setTypeParser(20, (value) => (value === null ? null : Number(value)));

const pool = new pg.Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  max: 10,
  options: '-c timezone=Africa/Nairobi',
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (erreur) => {
  console.error('Erreur inattendue du pool PostgreSQL :', erreur.message);
});

/**
 * Convertit les marqueurs `?` en marqueurs PostgreSQL.
 *
 * Le parcours ignore les chaines, les identifiants quotes et les commentaires :
 * un `?` dans un litteral ne doit pas devenir un parametre.
 */
function convertirPlaceholders(sql) {
  let sortie = '';
  let index = 0;
  let etat = 'normal';

  for (let i = 0; i < sql.length; i += 1) {
    const caractere = sql[i];
    const suivant = sql[i + 1];

    if (etat === 'normal') {
      if (caractere === "'") {
        etat = 'chaine';
        sortie += caractere;
      } else if (caractere === '"') {
        etat = 'identifiant';
        sortie += caractere;
      } else if (caractere === '-' && suivant === '-') {
        etat = 'commentaire_ligne';
        sortie += '--';
        i += 1;
      } else if (caractere === '/' && suivant === '*') {
        etat = 'commentaire_bloc';
        sortie += '/*';
        i += 1;
      } else if (caractere === '?') {
        index += 1;
        sortie += `$${index}`;
      } else {
        sortie += caractere;
      }
      continue;
    }

    if (etat === 'chaine') {
      sortie += caractere;
      if (caractere === '\\' && suivant !== undefined) {
        sortie += suivant;
        i += 1;
      } else if (caractere === "'" && suivant === "'") {
        sortie += suivant;
        i += 1;
      } else if (caractere === "'") {
        etat = 'normal';
      }
      continue;
    }

    if (etat === 'identifiant') {
      sortie += caractere;
      if (caractere === '"' && suivant === '"') {
        sortie += suivant;
        i += 1;
      } else if (caractere === '"') {
        etat = 'normal';
      }
      continue;
    }

    if (etat === 'commentaire_ligne') {
      sortie += caractere;
      if (caractere === '\n') etat = 'normal';
      continue;
    }

    if (etat === 'commentaire_bloc') {
      sortie += caractere;
      if (caractere === '*' && suivant === '/') {
        sortie += '/';
        i += 1;
        etat = 'normal';
      }
    }
  }

  return sortie;
}

function preparerSql(sql) {
  let texte = String(sql);

  // Identifiants entre backticks : `colonne` -> "colonne".
  texte = texte.replace(/`([^`]+)`/g, (_, identifiant) => `"${identifiant.replace(/"/g, '""')}"`);

  // Fonction `CURDATE()` sans équivalent PostgreSQL direct.
  texte = texte.replace(/\bCURDATE\s*\(\s*\)/gi, 'CURRENT_DATE');

  return convertirPlaceholders(texte);
}

function estEcriture(sql) {
  const sansCommentaires = sql
    .replace(/^\s*(--[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*/g, '')
    .trimStart();
  return /^(INSERT|UPDATE|DELETE|MERGE|TRUNCATE)\b/i.test(sansCommentaires);
}

function estInsertion(sql) {
  const sansCommentaires = sql
    .replace(/^\s*(--[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*/g, '')
    .trimStart();
  return /^INSERT\b/i.test(sansCommentaires);
}

async function executer(client, sql, params = []) {
  let texte = preparerSql(sql);

  /* PostgreSQL ne renvoie pas d'identifiant auto-incremente sans RETURNING.
     On l'ajoute aux INSERT pour conserver `resultat.insertId`, utilise dans
     une vingtaine de modeles. `RETURNING *` fonctionne aussi pour les tables
     sans colonne `id` ; insertId vaut alors 0. */
  if (estInsertion(texte) && !/\bRETURNING\b/i.test(texte)) {
    texte = `${texte.replace(/;\s*$/, '')} RETURNING *`;
  }

  try {
    const resultat = await client.query(texte, params);
    const commande = (resultat.command || '').toUpperCase();

    if (commande === 'SELECT' || commande === 'SHOW' || commande === 'EXPLAIN') {
      return resultat.rows;
    }

    if (estEcriture(texte) || commande === 'INSERT' || commande === 'UPDATE' || commande === 'DELETE') {
      return {
        insertId: resultat.rows?.[0]?.id ?? 0,
        affectedRows: resultat.rowCount ?? 0,
        changedRows: resultat.rowCount ?? 0,
        rows: resultat.rows,
      };
    }

    return resultat.rows;
  } catch (erreur) {
    // Le texte de la requete facilite le diagnostic des requetes converties.
    erreur.sql = texte;
    throw erreur;
  }
}

function creerConnexion(client) {
  return {
    query: (sql, params) => executer(client, sql, params),
    execute: async (sql, params) => [await executer(client, sql, params), null],
    beginTransaction: () => client.query('BEGIN'),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK'),
    release: () => client.release(),
  };
}

pool.execute = async (sql, params) => [await executer(pool, sql, params), null];
pool.getConnection = async () => creerConnexion(await pool.connect());

export default {
  query: (sql, params) => executer(pool, sql, params),
  withTransaction: async (traitement) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const resultat = await traitement(creerConnexion(client));
      await client.query('COMMIT');
      return resultat;
    } catch (erreur) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* La transaction est peut-etre deja fermee par PostgreSQL. */
      }
      throw erreur;
    } finally {
      client.release();
    }
  },
  pool,
};

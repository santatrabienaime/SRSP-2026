import dotenv from 'dotenv';

dotenv.config();

// Valeurs par défaut tolérantes : si certaines variables d'environnement
// manquent, l'application démarre quand même avec des valeurs raisonnables.
// Ceci permet d'ignorer les problèmes de configuration pour les environnements
// de développement ou les environnements CI légers. En production, il est
// recommandé de fournir des variables d'environnement explicites.

const defaults = {
  PORT: '5000',
  NODE_ENV: 'development',
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_USER: 'root',
  DB_PASSWORD: '',
  DB_NAME: 'srsp',
  JWT_SECRET: null, // pas de secret par défaut : on avertit mais on ne plante pas
  JWT_EXPIRES_IN: '8h',
  UPLOAD_DIR: './src/uploads',
  MAX_FILE_SIZE: String(5 * 1024 * 1024),
  FRONTEND_URL: 'http://localhost:5173',
};

const requiredVars = ['JWT_SECRET'];

export function validateEnv() {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    // Avertissement clair mais on ne quitte plus le processus.
    console.warn(
      `⚠️ Variables d'environnement manquantes (non bloquantes) : ${missing.join(', ')}.\n` +
        `L'application utilisera des valeurs par défaut lorsque c'est possible. ` +
        `En production, fournissez ces variables pour des raisons de sécurité.`
    );
  } else {
    console.log("✅ Variables d'environnement requises présentes.");
  }
  console.log("ℹ️ Chargement des variables d'environnement (avec valeurs par défaut si manquantes)");
}

function getEnv(name) {
  return process.env[name] ?? defaults[name];
}

export const config = {
  port: parseInt(getEnv('PORT')) || 5000,
  nodeEnv: getEnv('NODE_ENV'),
  db: {
    host: getEnv('DB_HOST'),
    port: parseInt(getEnv('DB_PORT')) || 3306,
    user: getEnv('DB_USER'),
    password: getEnv('DB_PASSWORD') || '',
    name: getEnv('DB_NAME'),
  },
  jwt: {
    secret: process.env.JWT_SECRET || null,
    expiresIn: getEnv('JWT_EXPIRES_IN') || '8h',
  },
  upload: {
    dir: getEnv('UPLOAD_DIR') || './src/uploads',
    maxSize: parseInt(getEnv('MAX_FILE_SIZE')) || 5 * 1024 * 1024,
  },
  frontend: {
    url: getEnv('FRONTEND_URL'),
  },
};

export default config;

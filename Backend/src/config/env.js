import dotenv from 'dotenv';

dotenv.config();

const defaults = {
  PORT: '5000',
  NODE_ENV: 'development',
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_USER: 'root',
  DB_PASSWORD: '',
  DB_NAME: 'srsp',
  JWT_SECRET: null, // pas de secret par défaut : obligatoire en production
  JWT_EXPIRES_IN: '8h',
  UPLOAD_DIR: './src/uploads',
  MAX_FILE_SIZE: String(5 * 1024 * 1024),
  FRONTEND_URL: 'http://localhost:5173',
};

const requiredVars = ['JWT_SECRET'];

export function validateEnv() {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    // Un secret JWT manquant doit faire échouer le démarrage : signer des
    // tokens avec une valeur nulle ou inventée est une faille de sécurité.
    console.error(`❌ Variables d'environnement manquantes : ${missing.join(', ')}`);
    console.error("L'application ne démarre pas sans ces variables.");
    process.exit(1);
  }
  console.log("✅ Variables d'environnement requises présentes.");
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

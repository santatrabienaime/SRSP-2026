import dotenv from 'dotenv';

dotenv.config();

const requiredVars = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
];

export function validateEnv() {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`❌ Variables d'environnement manquantes : ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('✅ Variables d\'environnement validées.');
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './src/uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

export default config;
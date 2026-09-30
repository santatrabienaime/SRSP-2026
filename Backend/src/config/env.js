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
    /* Huit heures, et non vingt-quatre. Le document de fonctionnalités
       obligatoires fixe 8 h : c'est la durée d'une journée de travail. Un jeton
       valable 24 h reste valide la nuit et le lendemain, et survit à la
       fermeture du poste de travail. Le défaut est aligné sur la valeur du
       `.env`, sans quoi un déploiement sans `.env` retrouverait 24 h sans
       qu'aucun test ne s'en aperçoive. */
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './src/uploads',
    /* Cinq Mo, et non dix. Le document de fonctionnalités obligatoires fixe
       5 Mo, ce que confirme chaque type de document du référentiel. Un défaut de
       10 Mo rendait le `.env` et le code désaccordés : modifier le premier
       n changeait rien tant que le second restait à 10. */
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

export default config;
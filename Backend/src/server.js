import app from './app.js';
import { validateEnv, config } from './config/env.js';
import { logger } from './config/logger.js';

// Validation des variables d'environnement au démarrage
validateEnv();

const server = app.listen(config.port, () => {
  logger.info(`🚀 Serveur démarré sur http://localhost:${config.port}`);
  logger.info(`🌍 Environnement : ${config.nodeEnv}`);
  logger.info(`📦 Base de données : ${config.db.name}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  logger.error('UnhandledRejection :', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('UncaughtException :', err.message);
  process.exit(1);
});

export default server;
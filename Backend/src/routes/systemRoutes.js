import express from 'express';
import os from 'node:os';
import fs from 'node:fs';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rbacMiddleware } from '../middlewares/rbacMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * Monitoring léger (référentiel : CPU, RAM, disque, uptime).
 *
 * Tout est lu sur l'hôte qui exécute l'application, avec les compteurs du
 * système d'exploitation — aucune dépendance externe. Un bloc indisponible
 * (disque sans statfs) est simplement omis : le reste de la carte reste utile.
 */
router.get('/', rbacMiddleware('system_config'), (req, res) => {
  const cpus = os.cpus();
  const charge = os.loadavg()[0] || 0;
  const memoire = {
    totale: os.totalmem(),
    disponible: os.freemem(),
    processus: process.memoryUsage().rss,
  };

  let disque = null;
  try {
    const st = fs.statfsSync(process.cwd());
    const total = st.blocks * st.bsize;
    const libre = st.bavail * st.bsize;
    disque = { total, libre, utilise: total - libre };
  } catch {
    /* statfs indisponible : on omet le bloc plutôt que d'échouer. */
  }

  res.json({
    charge,
    coeurs: cpus.length,
    charge_pct: cpus.length
      ? Math.min(100, Math.round((charge / cpus.length) * 100))
      : null,
    memoire,
    memoire_utilisee_pct: memoire.totale
      ? Math.round(((memoire.totale - memoire.disponible) / memoire.totale) * 100)
      : null,
    disque,
    uptime_processus: Math.round(process.uptime()),
    uptime_systeme: os.uptime(),
    node: process.version,
    date: new Date(),
  });
});

export default router;

import express from 'express';
import cors from 'cors';

import { corsOptions } from './config/cors.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { rateLimiter } from './middlewares/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import dossierRoutes from './routes/dossierRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import courrierRoutes from './routes/courrierRoutes.js';
import divisionRoutes from './routes/divisionRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import personnelRoutes from './routes/personnelRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import historiqueRoutes from './routes/historiqueRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import statistiqueRoutes from './routes/statistiqueRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import commentaireRoutes from './routes/commentaireRoutes.js';
import secoursRoutes from './routes/secoursRoutes.js';
import geographieRoutes from './routes/geographieRoutes.js';
import referentielRoutes from './routes/referentielRoutes.js';
import rapportRoutes from './routes/rapportRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import depouillementRoutes from './routes/depouillementRoutes.js';
import mandatementRoutes from './routes/mandatementRoutes.js';
import correspondanceRoutes from './routes/correspondanceRoutes.js';
import archiveRoutes from './routes/archiveRoutes.js';
import bordereauRoutes from './routes/bordereauRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import reinitialisationRoutes from './routes/reinitialisationRoutes.js';
import operationRoutes from './routes/operationRoutes.js';
import immatriculationRoutes from './routes/immatriculationRoutes.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', rateLimiter);

app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date() })
);

app.use('/api/auth', authRoutes);
/* Les comptes se gèrent par `/api/personnel` : la fiche et le compte de
   connexion ne font qu'un. `/api/users` en était un doublon qui permettait
   précisément ce que l'écran Personnel interdit — un compte sans fiche. */
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
// L'API geographie est montee AVANT les routes de dossiers : `/dossiers/:id`
// capterait `/dossiers/1/district` si elle etait enregistree apres.
app.use('/api/geographie', geographieRoutes);
app.use('/api/referentiel', referentielRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/courriers', courrierRoutes);
app.use('/api/divisions', divisionRoutes);
app.use('/api/agents', agentRoutes);
/* Personnel : la fiche et le compte de connexion, écrits ensemble. */
app.use('/api/personnel', personnelRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/historique', historiqueRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/statistiques', statistiqueRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/dossiers', commentaireRoutes);
app.use('/api/rapports', rapportRoutes);
app.use('/api/admin/backup', backupRoutes);
app.use('/api/admin/system', systemRoutes);
app.use('/api/dossiers', depouillementRoutes);
app.use('/api/dossiers', mandatementRoutes);
app.use('/api/dossiers', secoursRoutes);
app.use('/api/correspondances', correspondanceRoutes);
app.use('/api/archives', archiveRoutes);
app.use('/api/bordereaux', bordereauRoutes);
// Pièces jointes : /api/dossiers/:id/documents. Monté après dossierRoutes,
// dont les routes /:id ne capturent pas les chemins à deux segments.
app.use('/api/dossiers', documentRoutes);
// Demandes de réinitialisation de mot de passe (administration).
app.use('/api/reinitialisations', reinitialisationRoutes);
// Données propres à l'opération d'un dossier : /api/dossiers/:id/operation
app.use('/api/dossiers', operationRoutes);
// Module d'immatriculation de la Coordination.
app.use('/api/immatriculations', immatriculationRoutes);

app.use(errorMiddleware);

export default app;
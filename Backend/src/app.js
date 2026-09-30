import express from 'express';
import cors from 'cors';

import { corsOptions } from './config/cors.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { rateLimiter } from './middlewares/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import dossierRoutes from './routes/dossierRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import courrierRoutes from './routes/courrierRoutes.js';
import divisionRoutes from './routes/divisionRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import historiqueRoutes from './routes/historiqueRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import statistiqueRoutes from './routes/statistiqueRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import ordreDeplacementRoutes from './routes/ordreDeplacementRoutes.js';
import secoursRoutes from './routes/secoursRoutes.js';
import geographieRoutes from './routes/geographieRoutes.js';
import rapportRoutes from './routes/rapportRoutes.js';
import referentielRoutes from './routes/referentielRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import depouillementRoutes from './routes/depouillementRoutes.js';
import calculRoutes from './routes/calculRoutes.js';
import mandatementRoutes from './routes/mandatementRoutes.js';
import correspondanceRoutes from './routes/correspondanceRoutes.js';
import commentaireRoutes from './routes/commentaireRoutes.js';
import archiveRoutes from './routes/archiveRoutes.js';
import administratifRoutes from './routes/administratifRoutes.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', rateLimiter);

app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date() })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
// L'API geographie est montee AVANT les routes de dossiers : `/dossiers/:id`
// capterait `/dossiers/1/district` si elle etait enregistree apres.
app.use('/api/geographie', geographieRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/courriers', courrierRoutes);
app.use('/api/divisions', divisionRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/historique', historiqueRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/statistiques', statistiqueRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/ordres-deplacement', ordreDeplacementRoutes);
app.use('/api/rapports', rapportRoutes);
app.use('/api/referentiel', referentielRoutes);
app.use('/api/admin/backup', backupRoutes);
app.use('/api/dossiers', depouillementRoutes);
app.use('/api/dossiers', calculRoutes);
app.use('/api/dossiers', mandatementRoutes);
app.use('/api/dossiers', secoursRoutes);
app.use('/api/dossiers', commentaireRoutes);
app.use('/api/correspondances', correspondanceRoutes);
app.use('/api/archives', archiveRoutes);
app.use('/api/administratif', administratifRoutes);

app.use(errorMiddleware);

export default app;
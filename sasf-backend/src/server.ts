import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler.middleware';

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import familyMembersRoutes from './routes/familyMembers.routes';
import conditionsRoutes from './routes/conditions.routes';
import allergiesRoutes from './routes/allergies.routes';
import medicationsRoutes from './routes/medications.routes';
import emergencyContactsRoutes from './routes/emergencyContacts.routes';
import vitalSignsRoutes from './routes/vitalSigns.routes';
import symptomsRoutes from './routes/symptoms.routes';
import nutritionRoutes from './routes/nutrition.routes';
import exerciseRoutes from './routes/exercise.routes';
import psychologyRoutes from './routes/psychology.routes';
import insightsRoutes from './routes/insights.routes';
import reportRoutes from './routes/report.routes';
import sharingRoutes from './routes/sharing.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
// Limite padrão do Express (100kb) é pequeno demais pra foto de perfil em
// base64 (fotoUrl); aumentado para acomodar isso sem precisar de upload de
// arquivo/armazenamento externo.
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/family-members', familyMembersRoutes);
app.use('/api/family-members/:membroId/conditions', conditionsRoutes);
app.use('/api/family-members/:membroId/allergies', allergiesRoutes);
app.use('/api/family-members/:membroId/medications', medicationsRoutes);
app.use('/api/family-members/:membroId/emergency-contacts', emergencyContactsRoutes);
app.use('/api/family-members/:membroId/vital-signs', vitalSignsRoutes);
app.use('/api/family-members/:membroId/symptoms', symptomsRoutes);
app.use('/api/family-members/:membroId/nutrition', nutritionRoutes);
app.use('/api/family-members/:membroId/exercises', exerciseRoutes);
app.use('/api/family-members/:membroId/psychology', psychologyRoutes);
app.use('/api/family-members/:membroId/insights', insightsRoutes);
app.use('/api/family-members/:membroId/report', reportRoutes);
app.use('/api', sharingRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[SASF] Servidor rodando na porta ${env.PORT} (${env.NODE_ENV})`);
});

export default app;

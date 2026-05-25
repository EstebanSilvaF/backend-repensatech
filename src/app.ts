import express from 'express';
import authRoutes from './routes/auth.routes';
import universityRoutes from './routes/university.routes';
import notificationRoutes from './routes/notification.routes';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/notifications', notificationRoutes);

export default app;

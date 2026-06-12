import express from 'express';
import { corsMiddleware } from './config/cors';
import authRoutes from './routes/auth.routes';
import universityRoutes from './routes/university.routes';
import notificationRoutes from './routes/notification.routes';
import productRoutes from './routes/product.routes';
import chatRoutes from './routes/chat.routes';
import reservationRoutes from './routes/reservation.routes';
import transactionRoutes from './routes/transaction.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

app.use(corsMiddleware());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);

export default app;

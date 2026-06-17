import 'dotenv/config';
import app from './app';
import { prisma } from './infrastructure/persistence/prisma';
import { env } from './infrastructure/config/env';
import { scheduleJobs } from './application/jobs/scheduleJobs';

async function bootstrap() {
  try {
    await prisma.$connect();
    scheduleJobs();
    app.listen(env.port, () => {
      console.log(`Servidor corriendo en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();

import 'dotenv/config';
import app from './app';
import { initDatabase } from './config/initDb';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();

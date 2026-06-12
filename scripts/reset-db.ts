import 'dotenv/config';
import { pool } from '../src/config/db';

async function resetDatabase(): Promise<void> {
  console.log(`Reseteando base de datos "${process.env.DB_NAME}"...`);

  await pool.query('DROP SCHEMA public CASCADE');
  await pool.query('CREATE SCHEMA public');
  await pool.query('GRANT ALL ON SCHEMA public TO postgres');
  await pool.query('GRANT ALL ON SCHEMA public TO public');

  console.log('Listo. Reinicia el servidor (npm run dev) para crear tablas y seed.');
}

resetDatabase()
  .catch((err) => {
    console.error('Error al resetear la BD:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());

import fs from 'fs';
import path from 'path';
import { pool } from './db';

function resolveSchemaPath(): string {
  const candidates = [
    path.join(__dirname, '..', 'db', 'schema.sql'),
    path.join(process.cwd(), 'db', 'schema.sql'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error('No se encontró db/schema.sql');
}

async function isSchemaInitialized(): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'universities'
    ) AS exists
  `);
  return result.rows[0].exists;
}

export async function initDatabase(): Promise<void> {
  if (await isSchemaInitialized()) {
    console.log('Base de datos ya inicializada, omitiendo esquema.');
    return;
  }

  const schemaPath = resolveSchemaPath();
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Creando tablas y tipos desde db/schema.sql...');
  await pool.query(sql);
  console.log('Esquema de base de datos creado correctamente.');
}

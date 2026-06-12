import fs from 'fs';
import path from 'path';
import { pool } from './db';

const MIGRATIONS = [
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_public_id TEXT;`,
  // BD antigua: image_url opcional → rellenar placeholder antes de NOT NULL (solo si aplica)
  `UPDATE products SET image_url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
   WHERE image_url IS NULL;`,
  `ALTER TABLE products ALTER COLUMN image_url SET NOT NULL;`,
];

function resolveDbFile(filename: string): string {
  const candidates = [
    path.join(__dirname, '..', 'db', filename),
    path.join(process.cwd(), 'db', filename),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(`No se encontró db/${filename}`);
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

async function isDatabaseSeeded(): Promise<boolean> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM universities`
  );
  return parseInt(result.rows[0].count, 10) > 0;
}

async function runMigrations(): Promise<void> {
  for (const sql of MIGRATIONS) {
    await pool.query(sql);
  }
}

export async function initDatabase(): Promise<void> {
  if (!(await isSchemaInitialized())) {
    const schemaPath = resolveDbFile('schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Creando tablas y tipos desde db/schema.sql...');
    await pool.query(sql);
    console.log('Esquema de base de datos creado correctamente.');
  } else {
    console.log('Base de datos ya inicializada, omitiendo esquema.');
  }

  await runMigrations();

  if (!(await isDatabaseSeeded())) {
    const seedPath = resolveDbFile('seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('Insertando datos de prueba desde db/seed.sql...');
    await pool.query(seedSql);
    console.log('Seed aplicado correctamente.');
  } else {
    console.log('Base de datos ya tiene datos, omitiendo seed.');
  }
}

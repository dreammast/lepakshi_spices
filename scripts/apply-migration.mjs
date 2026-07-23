import { readFileSync, existsSync } from 'node:fs';
import { createPool } from 'mysql2/promise';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env');
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

const caPath = process.env.DB_SSL_CA_PATH || './server/certs/tidb-ca.pem';
const ssl = existsSync(caPath) ? { rejectUnauthorized: true, ca: readFileSync(caPath, 'utf8') } : undefined;

const pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'lepakshispices',
  ssl,
  multipleStatements: true
});

const migrationPath = resolve(dirname(fileURLToPath(import.meta.url)), '../database/migrations/0002_add-api-tables.sql');
const rawSql = readFileSync(migrationPath, 'utf8');
const statements = rawSql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

try {
  const conn = await pool.getConnection();
  console.log('Connected to TiDB, applying 0002_add-api-tables.sql...');
  for (const sql of statements) {
    try {
      await conn.query(sql);
      const match = sql.match(/(?:CREATE TABLE|CREATE INDEX) [`']?(\w+)/i);
      console.log(`[✓] ${match ? match[1] : 'statement'}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists')) {
        console.log(`[~] Skipped (exists): ${sql.slice(0, 60)}...`);
      } else {
        throw err;
      }
    }
  }
  conn.release();
  console.log('\n[SUCCESS] Migration 0002 applied.');
  process.exit(0);
} catch (err) {
  console.error('[ERROR]', err);
  process.exit(1);
}

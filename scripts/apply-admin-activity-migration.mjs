import 'dotenv/config';
import mysql from 'mysql2/promise';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const caPath = resolve(process.cwd(), process.env.DB_SSL_CA_PATH || './server/certs/tidb-ca.pem');
const conn = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 4000), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, ssl: { ca: readFileSync(caPath, 'utf8'), rejectUnauthorized: true } });
const statements = readFileSync(resolve(process.cwd(), 'database/migrations/0003_admin_activity_columns.sql'), 'utf8').split(';').map(s => s.trim()).filter(Boolean);
try {
  for (const statement of statements) {
    try { await conn.query(statement); console.log('APPLIED:', statement.split(/\s+/).slice(0, 5).join(' ')); }
    catch (error) { if (/already exists|duplicate column/i.test(error.message)) console.log('SKIPPED: already applied'); else throw error; }
  }
  console.log('Admin activity migration complete.');
} finally { await conn.end(); }

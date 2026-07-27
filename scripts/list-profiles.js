import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const caPath = resolve(root, 'server/certs/tidb-ca.pem');

const ssl = existsSync(caPath)
  ? { rejectUnauthorized: true, ca: readFileSync(caPath, 'utf8') }
  : undefined;

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl
});

try {
  const [rows] = await conn.query('SELECT id, email, first_name, role, password_hash FROM customer_profiles');
  console.log('Customer Profiles:');
  console.log(JSON.stringify(rows, null, 2));
} finally {
  await conn.end();
}

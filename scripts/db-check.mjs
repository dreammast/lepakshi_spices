import 'dotenv/config';
import mysql from 'mysql2/promise';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const configured = process.env.DB_SSL_CA_PATH || './server/certs/tidb-ca.pem';
const candidates = [configured, resolve(root, configured), resolve(root, 'server/certs/tidb-ca.pem')];
const caPath = candidates.find((value) => value && existsSync(value));
const expected = ['categories','products','product_variants','product_images','customer_profiles','orders','order_items','coupons','campaigns','recipes','website_settings','wholesale_inquiries','quotations','quotation_items','audit_logs'];

console.log(`DB host: ${process.env.DB_HOST}:${process.env.DB_PORT || 4000}`);
console.log(`DB name: ${process.env.DB_NAME}`);
console.log(`SSL CA: ${caPath || 'NOT FOUND'}`);
if (!caPath) process.exitCode = 2;

let connection;
try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    ssl: caPath ? { ca: readFileSync(caPath, 'utf8'), rejectUnauthorized: true } : { rejectUnauthorized: false },
    connectTimeout: 10000
  });
  const [[server]] = await connection.query('SELECT VERSION() AS version, NOW() AS server_time');
  console.log(`CONNECTED: MySQL/TiDB ${server.version}; server time ${server.server_time}`);
  const [rows] = await connection.query('SHOW TABLES');
  const tables = rows.map((row) => Object.values(row)[0]).sort();
  console.log(`TABLES (${tables.length}): ${tables.join(', ') || '(none)'}`);
  const missing = expected.filter((table) => !tables.includes(table));
  if (missing.length) console.warn(`MISSING EXPECTED TABLES: ${missing.join(', ')}`);
  for (const table of tables) {
    const [[row]] = await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
    console.log(`  ${table}: ${row.count}`);
  }
  console.log('DATABASE CHECK PASSED');
} catch (error) {
  console.error(`DATABASE CHECK FAILED: ${error.code || error.message}`);
  process.exitCode = 1;
} finally { await connection?.end(); }

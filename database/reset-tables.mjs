import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(projectRoot, '.env') });

let sslCaPath = process.env.DB_SSL_CA_PATH || './server/certs/tidb-ca.pem';
if (sslCaPath && !existsSync(sslCaPath)) {
  sslCaPath = resolve(projectRoot, './server/certs/tidb-ca.pem');
}

const ssl = sslCaPath && existsSync(sslCaPath)
  ? { rejectUnauthorized: true, ca: readFileSync(sslCaPath, 'utf8') }
  : undefined;

console.log('Connecting to TiDB database...');
const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl
});

try {
  console.log('Fetching all existing tables...');
  const [rows] = await conn.query('SHOW TABLES');
  const dbName = process.env.DB_NAME || 'lepakshispices';
  const tables = rows.map(r => Object.values(r)[0]);

  if (tables.length === 0) {
    console.log('Database has no tables.');
  } else {
    console.log(`Found ${tables.length} tables to drop:`, tables);
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tables) {
      console.log(`Dropping table \`${table}\`...`);
      await conn.query(`DROP TABLE IF EXISTS \`${table}\``);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('All old tables dropped successfully!');
  }
} catch (err) {
  console.error('Error resetting database:', err);
} finally {
  await conn.end();
}

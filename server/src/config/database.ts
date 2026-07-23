import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { env } from './env.js';

function getSslConfig() {
  const candidates = [
    env.DB_SSL_CA_PATH,
    resolve(process.cwd(), env.DB_SSL_CA_PATH || ''),
    resolve(process.cwd(), './certs/tidb-ca.pem'),
    resolve(process.cwd(), './server/certs/tidb-ca.pem'),
    resolve(process.cwd(), '../server/certs/tidb-ca.pem'),
  ];

  for (const path of candidates) {
    if (path && existsSync(path)) {
      try {
        return {
          rejectUnauthorized: true,
          ca: readFileSync(path, 'utf8')
        };
      } catch {}
    }
  }

  // Fallback: TiDB Cloud requires SSL/TLS transport even if CA file path is omitted
  return {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  };
}

const pool = createPool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT || 4000),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: getSslConfig(),
  waitForConnections: true,
  connectionLimit: 10
});

export const db = drizzle(pool);

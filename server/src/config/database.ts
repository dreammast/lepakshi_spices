import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { env } from './env.js';

let sslCaPath = env.DB_SSL_CA_PATH;
if (sslCaPath && !existsSync(sslCaPath)) {
  const candidate1 = resolve(process.cwd(), sslCaPath);
  const candidate2 = resolve(process.cwd(), sslCaPath.replace(/^\.\/server\//, './'));
  const candidate3 = resolve(process.cwd(), '../', sslCaPath);
  if (existsSync(candidate1)) sslCaPath = candidate1;
  else if (existsSync(candidate2)) sslCaPath = candidate2;
  else if (existsSync(candidate3)) sslCaPath = candidate3;
}

const ssl = sslCaPath && existsSync(sslCaPath)
  ? {
      rejectUnauthorized: true,
      ca: readFileSync(sslCaPath, 'utf8')
    }
  : undefined;

const pool = createPool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl,
  waitForConnections: true,
  connectionLimit: 10
});

export const db = drizzle(pool);

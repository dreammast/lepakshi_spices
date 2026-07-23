import { defineConfig } from 'drizzle-kit';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import 'dotenv/config';

let caPath = process.env.DATABASE_CA || process.env.DB_SSL_CA_PATH || './server/certs/tidb-ca.pem';

if (caPath && !existsSync(caPath)) {
  const c1 = resolve(process.cwd(), caPath);
  const c2 = resolve(process.cwd(), './server/certs/tidb-ca.pem');
  const c3 = resolve(process.cwd(), './certs/tidb-ca.pem');
  if (existsSync(c1)) caPath = c1;
  else if (existsSync(c2)) caPath = c2;
  else if (existsSync(c3)) caPath = c3;
}

const ssl = caPath && existsSync(caPath)
  ? { ca: readFileSync(caPath, 'utf8') }
  : undefined;

export default defineConfig({
  schema: './server/src/db/schema.ts',
  out: './database/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DATABASE_HOST || process.env.DB_HOST || '',
    port: Number(process.env.DATABASE_PORT || process.env.DB_PORT || 4000),
    user: process.env.DATABASE_USER || process.env.DB_USER || '',
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.DATABASE_NAME || process.env.DB_NAME || 'lepakshispices',
    ssl
  }
});

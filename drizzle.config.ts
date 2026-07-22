import { defineConfig } from 'drizzle-kit';
import { readFileSync } from 'node:fs';
import 'dotenv/config';

const caPath = process.env.DATABASE_CA || process.env.DB_SSL_CA_PATH || '';
const ssl = caPath ? { ca: readFileSync(caPath, 'utf8') } : undefined;

export default defineConfig({
  schema: './database/schema/schema.ts',
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

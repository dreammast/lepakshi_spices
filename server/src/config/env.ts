import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env');
function unquote(value: string) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = unquote(trimmed.slice(separator + 1).trim());
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_HOST: z.string().nonempty(),
  DB_PORT: z.string().default('4006'),
  DB_USER: z.string().nonempty(),
  DB_PASSWORD: z.string().nonempty(),
  DB_NAME: z.string().default('lepakshispices'),
  DB_SSL_CA_PATH: z.string().optional(),
  JWT_SECRET: z.string().min(10),
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().min(1).default('change-me'),
  CLOUDINARY_URL: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  SMTP_HOST: z.string().trim().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z.enum(['true', 'false']).default('false'),
  SMTP_USER: z.string().trim().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  MAIL_FROM: z.string().trim().min(1, 'MAIL_FROM is required'),
  FRONTEND_URL: z.string().optional().default('https://lepakshi-spices-user.vercel.app'),
  ADMIN_FRONTEND_URL: z.string().optional().default('https://lepakshi-spices-admin.vercel.app'),
  API_PUBLIC_URL: z.string().url().default('https://lepakshi-spices-1.onrender.com/api'),
});

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  throw new Error(`Environment validation error: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;

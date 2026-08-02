import nodemailer from "nodemailer";
import { env } from '../config/env.js';

console.log({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  user: env.SMTP_USER,
});
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE === 'true',
  requireTLS: env.SMTP_SECURE !== 'true',
  tls: { minVersion: 'TLSv1.2' },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export default transporter;

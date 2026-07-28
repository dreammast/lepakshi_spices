import nodemailer from 'nodemailer';
import { env } from './src/config/env.js';

async function main() {
  console.log('Starting SMTP test');
  console.log({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    from: env.MAIL_FROM,
  });

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE === 'true',
    requireTLS: env.SMTP_SECURE !== 'true',
    tls: { minVersion: 'TLSv1.2' },
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.verify();
  console.log('SMTP verified successfully');

  const info = await transporter.sendMail({
    from: env.MAIL_FROM,
    to: env.SMTP_USER,
    subject: 'SMTP test from Lepakshi Spices',
    text: 'If you received this email, Nodemailer and your SMTP credentials are working.',
    html: '<p>If you received this email, Nodemailer and your SMTP credentials are working.</p>',
  });

  console.log({ messageId: info.messageId, response: info.response });
}

main().catch((error) => {
  console.error('SMTP test failed');
  console.error(error);
  process.exit(1);
});

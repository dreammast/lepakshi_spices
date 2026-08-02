import { brevoSendMail } from './transporter.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export type EmailAttachment = {
  filename: string;
  contentBase64: string;
  contentType?: string;
};

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
};

export async function sendEmail({ to, subject, html, text, attachments }: SendEmailOptions) {
  return brevoSendMail({
    sender: { name: env.MAIL_FROM_NAME, email: env.MAIL_FROM_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text || html.replace(/<[^>]*>/g, ''),
    attachments,
  });
}

export async function sendEmailSafely(options: SendEmailOptions) {
  try {
    return await sendEmail(options);
  } catch (error) {
    logger.error({ err: error, recipient: options.to, subject: options.subject }, 'Customer email delivery failed');
    return null;
  }
}

export async function verifyEmailTransport() {
  // Brevo API key validation — no SMTP verify needed
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: { 'api-key': env.BREVO_API_KEY },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json() as any;
      logger.info({ account: data.name }, 'Brevo account verified');
      return true;
    }
    logger.warn({ status: res.status }, 'Brevo account verification failed');
    return false;
  } catch (error) {
    logger.warn({ err: error }, 'Brevo account verification failed; emails will be retried on the next action');
    return false;
  }
}

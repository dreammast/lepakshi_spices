import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { EmailAttachment } from './send-email.js';

const BREVO_API_BASE = 'https://api.brevo.com/v3';

export interface BrevoSendMailRequest {
  sender: { name: string; email: string };
  to: Array<{ email: string }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: EmailAttachment[];
}

export interface BrevoSendMailResponse {
  messageId: string;
}

async function brevoSendMail(payload: BrevoSendMailRequest, retries = 2): Promise<BrevoSendMailResponse> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);

      const res = await fetch(`${BREVO_API_BASE}/smtp/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: env.MAIL_FROM_NAME, email: env.MAIL_FROM_EMAIL },
          to: payload.to,
          subject: payload.subject,
          htmlContent: payload.htmlContent,
          ...(payload.textContent ? { textContent: payload.textContent } : {}),
          ...(payload.attachments?.length
            ? { attachment: payload.attachments.map((a) => ({ name: a.filename, content: a.contentBase64, ...(a.contentType ? { type: a.contentType } : {}) })) }
            : {}),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json() as BrevoSendMailResponse;
        logger.info({ messageId: json.messageId, recipient: payload.to[0].email }, 'Email sent via Brevo');
        return json;
      }

      const errorText = await res.text();
      if (res.status >= 500 && attempt < retries) {
        logger.warn({ status: res.status, attempt: attempt + 1, error: errorText }, 'Brevo temporary failure, retrying');
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      throw new Error(`Brevo API error (${res.status}): ${errorText}`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Brevo API request timed out');
      }
      if (attempt < retries && !error.message?.includes('Brevo API error')) {
        logger.warn({ attempt: attempt + 1, error: error.message }, 'Brevo request failed, retrying');
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Brevo API request failed after retries');
}

export { brevoSendMail };

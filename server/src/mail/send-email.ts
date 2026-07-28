import transporter from './transporter.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  return transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
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
  try {
    await transporter.verify();
    logger.info('SMTP transport is ready');
    return true;
  } catch (error) {
    logger.warn({ err: error }, 'SMTP transport verification failed; customer emails will be retried on the next action');
    return false;
  }
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]!));
}

function formatMoney(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

function emailLayout(title: string, body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF8F3;font-family:Arial,sans-serif"><div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden"><div style="background:#2A4A3C;padding:28px;text-align:center;color:#fff"><strong style="color:#C9920A;font-family:Georgia,serif;font-size:24px">Lepakshi Spices</strong></div><div style="padding:32px;color:#3d3832"><h2>${escapeHtml(title)}</h2>${body}</div><div style="padding:16px 32px;background:#FAF8F3;color:#7A7064;font-size:11px;text-align:center">Lepakshi Spices &copy; ${new Date().getFullYear()}</div></div></body></html>`;
}

type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  total: number;
  currency?: string | null;
  status?: string;
  trackingUrl?: string | null;
  invoiceUrl?: string | null;
  items: Array<{
    quantity: number;
    price: string;
    product?: { name?: string | null } | null;
    variant?: { label?: string | null } | null;
  }>;
};

function orderItemsHtml(order: OrderEmailData) {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px"><tbody>${order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(item.product?.name || item.variant?.label || 'Item')} x ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatMoney(Number(item.price) * item.quantity, order.currency || 'INR')}</td></tr>`,
    )
    .join('')}</tbody></table>`;
}

export function orderConfirmationEmailTemplate(order: OrderEmailData) {
  return emailLayout(
    'Order confirmed',
    `<p>Hi ${escapeHtml(order.customerName)},</p><p>Thank you for your order <strong>${escapeHtml(order.orderNumber)}</strong>. We'll let you know when it ships.</p>${orderItemsHtml(order)}<p style="font-size:18px;font-weight:bold;text-align:right">Total: ${formatMoney(order.total, order.currency || 'INR')}</p>${order.trackingUrl ? `<p style="text-align:right"><a href="${escapeHtml(order.trackingUrl)}" style="color:#2A4A3C;font-weight:600">Track your order</a></p>` : ''}`,
  );
}

export function receiptEmailTemplate(order: OrderEmailData) {
  return emailLayout(
    'Your invoice / receipt',
    `<p>Hi ${escapeHtml(order.customerName)},</p><p>This is your invoice and receipt for <strong>${escapeHtml(order.orderNumber)}</strong>.</p>${orderItemsHtml(order)}<p style="font-size:18px;font-weight:bold;text-align:right">Amount paid: ${formatMoney(order.total, order.currency || 'INR')}</p>${order.invoiceUrl ? `<p style="text-align:right"><a href="${escapeHtml(order.invoiceUrl)}" style="color:#2A4A3C;font-weight:600">View invoice</a></p>` : ''}`,
  );
}

export function orderStatusEmailTemplate(order: OrderEmailData) {
  const status = String(order.status || '').toLowerCase();
  const copy =
    status === 'shipped'
      ? 'Your order is on its way.'
      : status === 'delivered'
        ? 'Your order has been delivered. We hope you enjoy it!'
        : 'Your order has been cancelled.';

  return emailLayout(
    `Order ${status}`,
    `<p>Hi ${escapeHtml(order.customerName)},</p><p>${copy}</p><p>Order: <strong>${escapeHtml(order.orderNumber)}</strong></p>${order.trackingUrl ? `<p><a href="${escapeHtml(order.trackingUrl)}" style="color:#2A4A3C;font-weight:600">View order details</a></p>` : ''}`,
  );
}

export function wholesaleInquiryEmailTemplate(contactName: string, companyName: string, status: 'received' | 'approved' | 'rejected') {
  const copy =
    status === 'received'
      ? 'We have received your wholesale request and will review it shortly.'
      : status === 'approved'
        ? 'Your wholesale request has been approved. Our team will contact you with the next steps.'
        : 'Thank you for your interest. We are unable to approve your wholesale request at this time.';
  const title = status === 'received' ? 'Wholesale request received' : status === 'approved' ? 'Wholesale request approved' : 'Wholesale request rejected';
  return emailLayout(title, `<p>Hi ${escapeHtml(contactName)},</p><p>${copy}</p><p>Company: <strong>${escapeHtml(companyName)}</strong></p>`);
}

export function verificationEmailTemplate(name: string, verificationUrl: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF8F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:#2A4A3C;padding:32px;text-align:center;">
    <h1 style="color:#C9920A;font-size:24px;margin:0;font-family:'Georgia',serif;">Lepakshi Spices</h1>
    <p style="color:#fff;opacity:0.8;font-size:13px;margin:6px 0 0;">Premium Quality Spices</p>
  </div>
  <div style="padding:40px 32px;">
    <h2 style="color:#1A1714;font-size:20px;margin:0 0 16px;">Verify Your Email</h2>
    <p style="color:#7A7064;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Hi ${escapeHtml(name || 'there')},<br><br>
      Thank you for creating an account with Lepakshi Spices. Please verify your email address to get started.
    </p>
    <a href="${escapeHtml(verificationUrl)}" style="display:inline-block;background:#2A4A3C;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">Verify Email Address</a>
    <p style="color:#7A7064;font-size:12px;margin:24px 0 0;line-height:1.6;">
      This link expires in 10 minutes. If you did not create an account, you can safely ignore this email.
    </p>
  </div>
  <div style="padding:16px 32px;background:#FAF8F3;text-align:center;">
    <p style="color:#7A7064;font-size:11px;margin:0;">Lepakshi Spices &copy; ${new Date().getFullYear()}. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

export function forgotPasswordOtpTemplate(name: string, otp: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF8F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:#2A4A3C;padding:32px;text-align:center;">
    <h1 style="color:#C9920A;font-size:24px;margin:0;font-family:'Georgia',serif;">Lepakshi Spices</h1>
    <p style="color:#fff;opacity:0.8;font-size:13px;margin:6px 0 0;">Premium Quality Spices</p>
  </div>
  <div style="padding:40px 32px;text-align:center;">
    <h2 style="color:#1A1714;font-size:20px;margin:0 0 16px;">Password Reset</h2>
    <p style="color:#7A7064;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Hi ${escapeHtml(name || 'there')},<br><br>
      We received a request to reset your password. Use the code below:
    </p>
    <div style="background:#FAF8F3;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="font-size:32px;font-weight:700;color:#2A4A3C;letter-spacing:8px;margin:0;font-family:'Courier New',monospace;">${escapeHtml(otp)}</p>
    </div>
    <p style="color:#7A7064;font-size:12px;margin:0;line-height:1.6;">
      This code expires in 10 minutes. If you did not request this, please ignore this email.
    </p>
  </div>
  <div style="padding:16px 32px;background:#FAF8F3;text-align:center;">
    <p style="color:#7A7064;font-size:11px;margin:0;">Lepakshi Spices &copy; ${new Date().getFullYear()}. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

export function welcomeEmailTemplate(name: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF8F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:#2A4A3C;padding:32px;text-align:center;">
    <h1 style="color:#C9920A;font-size:24px;margin:0;font-family:'Georgia',serif;">Lepakshi Spices</h1>
    <p style="color:#fff;opacity:0.8;font-size:13px;margin:6px 0 0;">Premium Quality Spices</p>
  </div>
  <div style="padding:40px 32px;">
    <h2 style="color:#1A1714;font-size:20px;margin:0 0 16px;">Welcome to Lepakshi Spices!</h2>
    <p style="color:#7A7064;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Hi ${escapeHtml(name || 'there')},<br><br>
      Your account has been created successfully. Start exploring our premium spice collection and enjoy the authentic flavors of India.
    </p>
    <a href="${escapeHtml(env.FRONTEND_URL)}" style="display:inline-block;background:#2A4A3C;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">Shop Now</a>
  </div>
  <div style="padding:16px 32px;background:#FAF8F3;text-align:center;">
    <p style="color:#7A7064;font-size:11px;margin:0;">Lepakshi Spices &copy; ${new Date().getFullYear()}. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

export function passwordResetSuccessTemplate(name: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF8F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:#2A4A3C;padding:32px;text-align:center;">
    <h1 style="color:#C9920A;font-size:24px;margin:0;font-family:'Georgia',serif;">Lepakshi Spices</h1>
    <p style="color:#fff;opacity:0.8;font-size:13px;margin:6px 0 0;">Premium Quality Spices</p>
  </div>
  <div style="padding:40px 32px;">
    <h2 style="color:#1A1714;font-size:20px;margin:0 0 16px;">Password Reset Successful</h2>
    <p style="color:#7A7064;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Hi ${escapeHtml(name || 'there')},<br><br>
      Your password has been successfully reset. You can now log in with your new password.
    </p>
    <a href="${escapeHtml(env.FRONTEND_URL)}" style="display:inline-block;background:#2A4A3C;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">Sign In</a>
    <p style="color:#7A7064;font-size:12px;margin:24px 0 0;line-height:1.6;">
      If you did not reset your password, please contact our support team immediately.
    </p>
  </div>
  <div style="padding:16px 32px;background:#FAF8F3;text-align:center;">
    <p style="color:#7A7064;font-size:11px;margin:0;">Lepakshi Spices &copy; ${new Date().getFullYear()}. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

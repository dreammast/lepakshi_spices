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
    console.log("✅ SMTP Connected");

    const info = await transporter.sendMail({
      from: env.MAIL_FROM,
      to: "YOUR_TEST_EMAIL@gmail.com",
      subject: "SMTP Test",
      text: "SMTP is working!",
    });

    console.log(info);
  } catch (err) {
    console.error(err);
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
  paymentMethod?: string | null;
  shippingAddress?: any;
  items: Array<{
    quantity: number;
    price: string;
    product?: { name?: string | null } | null;
    variant?: { label?: string | null } | null;
  }>;
};

function formatAddress(addr: any) {
  if (!addr) return 'No shipping address provided';
  if (typeof addr === 'string') {
    try {
      addr = JSON.parse(addr);
    } catch {
      return escapeHtml(addr);
    }
  }
  const lines = [
    addr.name,
    addr.phone ? `Phone: ${addr.phone}` : null,
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(', '),
    addr.country
  ].filter(Boolean);
  return lines.map(line => escapeHtml(line)).join('<br>');
}

function orderItemsHtml(order: OrderEmailData) {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px"><tbody>${order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(item.product?.name || item.variant?.label || 'Item')} x ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatMoney(Number(item.price) * item.quantity, order.currency || 'INR')}</td></tr>`,
    )
    .join('')}</tbody></table>`;
}

export function orderConfirmationEmailTemplate(order: OrderEmailData) {
  const pm = String(order.paymentMethod || '').toLowerCase();
  const isUpi = pm === 'upi';
  const isCod = pm === 'cod';

  let paymentMethodLabel = 'UPI Payment';
  if (isCod) paymentMethodLabel = 'Cash on Delivery';

  const orderStatus = String(order.status || 'pending').toLowerCase();
  let statusLabel = 'Pending';
  if (isUpi && orderStatus === 'pending') {
    statusLabel = 'Pending Verification';
  } else {
    statusLabel = orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1);
  }

  let paymentAlertHtml = '';
  if (isUpi) {
    paymentAlertHtml = `
      <div style="background-color:#FFF9E6; border:1px solid #FFEBAA; border-radius:8px; padding:16px; margin:20px 0; color:#856404; font-size:14px; text-align:left;">
        <strong>Payment Status: Pending Verification</strong><br>
        Your payment details have been received and are pending verification by our team. Please note that your order will be processed only after the payment has been successfully verified.
      </div>
    `;
  } else if (isCod) {
    paymentAlertHtml = `
      <div style="background-color:#EBF5E6; border:1px solid #D2E7C4; border-radius:8px; padding:16px; margin:20px 0; color:#2D5016; font-size:14px; text-align:left;">
        <strong>Amount Payable on Delivery: ${formatMoney(order.total, order.currency || 'INR')}</strong><br>
        Please ensure the payment is made directly to the delivery agent upon successful delivery.
      </div>
    `;
  }

  const formattedAddress = formatAddress(order.shippingAddress);

  const htmlContent = `
    <p>Hi ${escapeHtml(order.customerName)},</p>
    <p>Thank you for your order with Lepakshi Spices! Below are the details of your order:</p>
    
    ${paymentAlertHtml}

    <div style="background-color:#FAF8F3; border-radius:12px; padding:20px; margin:20px 0; border:1px solid rgba(26,23,20,0.08); text-align:left;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; color:#3d3832;">
        <tr>
          <td style="padding:6px 0; font-weight:bold; width:130px; vertical-align:top;">Order ID:</td>
          <td style="padding:6px 0; font-family:monospace; vertical-align:top;">${escapeHtml(order.orderNumber)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-weight:bold; vertical-align:top;">Order Status:</td>
          <td style="padding:6px 0; vertical-align:top;">${escapeHtml(statusLabel)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-weight:bold; vertical-align:top;">Payment Method:</td>
          <td style="padding:6px 0; vertical-align:top;">${escapeHtml(paymentMethodLabel)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-weight:bold; vertical-align:top;">Shipping Address:</td>
          <td style="padding:6px 0; line-height:1.4; vertical-align:top;">${formattedAddress}</td>
        </tr>
      </table>
    </div>

    <h3 style="border-bottom:2px solid #2A4A3C; padding-bottom:8px; color:#2A4A3C; font-family:Georgia,serif; font-size:16px; text-align:left; margin-top:28px;">Order Summary</h3>
    ${orderItemsHtml(order)}
    
    <div style="margin-top:20px; text-align:right;">
      <p style="font-size:18px; font-weight:bold; margin:0 0 16px;">Total: ${formatMoney(order.total, order.currency || 'INR')}</p>
      ${order.trackingUrl ? `<p style="margin:0;"><a href="${escapeHtml(order.trackingUrl)}" style="display:inline-block; background-color:#2A4A3C; color:#ffffff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:13px;">Track your order</a></p>` : ''}
    </div>
  `;

  return emailLayout('Order confirmed', htmlContent);
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

export function paymentVerifiedEmailTemplate(order: OrderEmailData) {
  const formattedAddress = formatAddress(order.shippingAddress);
  const htmlContent = `
    <p>Hi ${escapeHtml(order.customerName)},</p>
    <p>We are pleased to inform you that your UPI payment for order <strong>${escapeHtml(order.orderNumber)}</strong> has been successfully verified! Your order is now being processed.</p>
    
    <div style="background-color:#EBF5E6; border:1px solid #D2E7C4; border-radius:8px; padding:16px; margin:20px 0; color:#2D5016; font-size:14px; text-align:left;">
      <strong>Payment Status: Verified</strong><br>
      Thank you for making the payment. Our team has confirmed your transaction ID/UTR.
    </div>

    <div style="background-color:#FAF8F3; border-radius:12px; padding:20px; margin:20px 0; border:1px solid rgba(26,23,20,0.08); text-align:left;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; color:#3d3832;">
        <tr>
          <td style="padding:6px 0; font-weight:bold; width:130px; vertical-align:top;">Order ID:</td>
          <td style="padding:6px 0; font-family:monospace; vertical-align:top;">${escapeHtml(order.orderNumber)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-weight:bold; vertical-align:top;">Order Status:</td>
          <td style="padding:6px 0; vertical-align:top;">Processing</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-weight:bold; vertical-align:top;">Payment Method:</td>
          <td style="padding:6px 0; vertical-align:top;">UPI Payment</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-weight:bold; vertical-align:top;">Shipping Address:</td>
          <td style="padding:6px 0; line-height:1.4; vertical-align:top;">${formattedAddress}</td>
        </tr>
      </table>
    </div>

    <h3 style="border-bottom:2px solid #2A4A3C; padding-bottom:8px; color:#2A4A3C; font-family:Georgia,serif; font-size:16px; text-align:left; margin-top:28px;">Order Summary</h3>
    ${orderItemsHtml(order)}
    
    <div style="margin-top:20px; text-align:right;">
      <p style="font-size:18px; font-weight:bold; margin:0 0 16px;">Total: ${formatMoney(order.total, order.currency || 'INR')}</p>
      ${order.trackingUrl ? `<p style="margin:0;"><a href="${escapeHtml(order.trackingUrl)}" style="display:inline-block; background-color:#2A4A3C; color:#ffffff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:13px;">Track your order</a></p>` : ''}
    </div>
  `;

  return emailLayout('Payment verified successfully', htmlContent);
}


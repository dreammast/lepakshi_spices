// ---------------------------------------------------------------------------
// Retail (B2C) email templates — composed from shared components.
// ---------------------------------------------------------------------------
import {
  emailLayout,
  heading,
  paragraph,
  buttonPrimary,
  buttonOutline,
  buttonRow,
  keyValueTable,
  sectionTitle,
  orderItemsTable,
  warningNotice,
  successNotice,
  dangerNotice,
  mutedNote,
  smallDivider,
  escapeHtml,
  formatMoney,
  formatDate,
  BRAND,
  COLORS,
  type RetailOrderItem,
} from './components.js';

export type RetailOrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  total: number;
  currency?: string | null;
  status?: string;
  trackingUrl?: string | null;
  invoiceUrl?: string | null;
  paymentMethod?: string | null;
  shippingAddress?: any;
  placedAt?: Date | string | null;
  items?: Array<RetailOrderItem>;
};

function orderStatusLabel(order: RetailOrderEmailData) {
  const paymentMethod = String(order.paymentMethod || '').toLowerCase();
  const orderStatus = String(order.status || 'pending').toLowerCase();
  if (paymentMethod === 'upi' && orderStatus === 'pending') return 'Pending Verification';
  if (orderStatus === 'processing') return 'Processing';
  return orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1);
}

function addressLines(addr: any) {
  if (!addr) return ['No shipping address provided'];
  if (typeof addr === 'string') {
    try {
      addr = JSON.parse(addr);
    } catch {
      return [String(addr)];
    }
  }
  return [
    addr.name,
    addr.phone ? `Phone: ${addr.phone}` : null,
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(', '),
    addr.country,
  ].filter(Boolean) as string[];
}

function formatAddress(addr: any) {
  return addressLines(addr)
    .map((line) => escapeHtml(line))
    .join('<br>');
}

function orderDetailCard(order: RetailOrderEmailData) {
  const pm = String(order.paymentMethod || '').toLowerCase();
  const paymentLabel = pm === 'cod' ? 'Cash on Delivery' : 'UPI Payment';
  return `<div style="background-color:${COLORS.background};border-radius:12px;padding:20px;margin:20px 0;border:1px solid rgba(26,23,20,0.08);text-align:left;">
    ${keyValueTable([
      { label: 'Order ID', value: `<span style="font-family:monospace;">${escapeHtml(order.orderNumber)}</span>` },
      { label: 'Order Status', value: escapeHtml(orderStatusLabel(order)) },
      { label: 'Payment Method', value: escapeHtml(paymentLabel) },
      { label: 'Order Date', value: escapeHtml(formatDate(order.placedAt)) },
      { label: 'Shipping Address', value: formatAddress(order.shippingAddress) },
    ])}
  </div>`;
}

function orderTotalsLine(order: RetailOrderEmailData) {
  return `<div style="margin-top:16px;text-align:right;">
    <p style="font-size:18px;font-weight:bold;margin:0 0 16px;">Total: ${formatMoney(order.total, order.currency || 'INR')}</p>
    ${order.trackingUrl ? `<p style="margin:0;"><a href="${escapeHtml(order.trackingUrl)}" style="display:inline-block;background-color:${COLORS.primary};color:#ffffff;padding:11px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:13px;">Track your order</a></p>` : ''}
  </div>`;
}

export function retailWelcomeEmail(name: string) {
  const html = `
    ${heading('Welcome to Lepakshi Spices!')}
    ${paragraph(`Hi ${escapeHtml(name || 'there')},<br><br>Thank you for creating an account with us. You now have access to our complete collection of premium, freshly ground Indian spices delivered straight to your door.`)}
    ${paragraph('Start exploring our range — from earthy turmeric and fiery chilli to aromatic garam masala and whole spices.')}
    ${buttonRow(buttonPrimary(`${BRAND.storefrontUrl}`, 'Shop Now'))}
    ${mutedNote('You can manage your profile, orders and saved addresses anytime from your account dashboard.')}
  `;
  return emailLayout('Welcome to Lepakshi Spices', html);
}

export function retailLoginNotificationEmail(name: string, meta?: { ip?: string; browser?: string; time?: string }) {
  const html = `
    ${heading('New sign-in to your account')}
    ${paragraph(`Hi ${escapeHtml(name || 'there')},<br><br>We noticed a new sign-in to your Lepakshi Spices account.`) }
    <div style="background-color:${COLORS.background};border-radius:12px;padding:20px;margin:20px 0;border:1px solid rgba(26,23,20,0.08);text-align:left;">
      ${keyValueTable([
        { label: 'Date & Time', value: escapeHtml(meta?.time || new Date().toLocaleString('en-IN')) },
        { label: 'IP Address', value: escapeHtml(meta?.ip || '—') },
        { label: 'Browser', value: escapeHtml(meta?.browser || '—') },
      ])}
    </div>
    ${paragraph(`If this was you, no action is needed. If you don't recognise this activity, please reset your password immediately and contact our support team.`)}
    ${buttonRow(buttonOutline(`${BRAND.storefrontUrl}`, 'View Account'))}
  `;
  return emailLayout('New sign-in notification', html);
}

export function retailOrderConfirmationEmail(order: RetailOrderEmailData) {
  const pm = String(order.paymentMethod || '').toLowerCase();
  let alert = '';
  if (pm === 'upi') {
    alert = warningNotice(
      'Payment Status: Pending Verification',
      'Your payment details have been received and are pending verification by our team. Your order will be processed only after the payment is successfully verified.',
    );
  } else if (pm === 'cod') {
    alert = successNotice(
      'Cash on Delivery',
      `Amount payable on delivery: <strong>${formatMoney(order.total, order.currency || 'INR')}</strong>. Please keep the amount ready for the delivery agent.`,
    );
  }

  const html = `
    ${paragraph(`Hi ${escapeHtml(order.customerName)},`)}
    ${paragraph(`Thank you for your order with Lepakshi Spices! Below are the details of your order.`)}
    ${alert}
    ${orderDetailCard(order)}
    ${sectionTitle('Order Summary')}
    ${orderItemsTable(order.items || [], order.currency || 'INR')}
    ${orderTotalsLine(order)}
  `;
  return emailLayout('Order confirmed', html);
}

export function retailPaymentVerifiedEmail(order: RetailOrderEmailData) {
  const html = `
    ${successNotice('Payment Verified', `We are pleased to confirm that your payment for order <strong>${escapeHtml(order.orderNumber)}</strong> has been successfully verified. Your order is now being processed.`)}
    ${orderDetailCard(order)}
    ${sectionTitle('Order Summary')}
    ${orderItemsTable(order.items || [], order.currency || 'INR')}
    ${orderTotalsLine(order)}
  `;
  return emailLayout('Payment verified successfully', html);
}

export function retailReceiptEmail(order: RetailOrderEmailData) {
  const html = `
    ${paragraph(`Hi ${escapeHtml(order.customerName)},`)}
    ${paragraph(`This is your invoice and receipt for <strong>${escapeHtml(order.orderNumber)}</strong>.`)}
    ${orderItemsTable(order.items || [], order.currency || 'INR')}
    <p style="font-size:18px;font-weight:bold;text-align:right;margin:14px 0 0;">Amount paid: ${formatMoney(order.total, order.currency || 'INR')}</p>
    ${order.invoiceUrl ? `<p style="text-align:right;"><a href="${escapeHtml(order.invoiceUrl)}" style="color:${COLORS.primary};font-weight:600;">View invoice</a></p>` : ''}
  `;
  return emailLayout('Your invoice / receipt', html);
}

export function retailOrderStatusEmail(order: RetailOrderEmailData) {
  const status = String(order.status || '').toLowerCase();

  const copyByStatus: Record<string, { title: string; body: string }> = {
    processing: {
      title: 'Order is being processed',
      body: `Great news — your order <strong>${escapeHtml(order.orderNumber)}</strong> is now being processed. Our team is carefully packing your spices to preserve their freshness and aroma.`,
    },
    shipped: {
      title: 'Your order is on the way!',
      body: `Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been shipped and is on its way to you. We'll update you as soon as it is delivered.`,
    },
    delivered: {
      title: 'Your order has been delivered',
      body: `Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been delivered. We hope you enjoy the authentic flavours of India!`,
    },
    cancelled: {
      title: 'Your order was cancelled',
      body: `Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been cancelled. If you believe this is an error, please reach out to our support team.`,
    },
  };

  const meta = copyByStatus[status] || {
    title: `Order ${status}`,
    body: `Your order <strong>${escapeHtml(order.orderNumber)}</strong> status has been updated to ${escapeHtml(status)}.`,
  };

  const html = `
    ${heading(meta.title)}
    ${paragraph(`Hi ${escapeHtml(order.customerName)},`)}
    ${paragraph(meta.body)}
    ${smallDivider()}
    ${sectionTitle('Order Summary')}
    ${orderItemsTable(order.items || [], order.currency || 'INR')}
    ${orderTotalsLine(order)}
  `;
  return emailLayout(meta.title, html);
}

export function retailOrderCancelledEmail(order: RetailOrderEmailData) {
  const html = `
    ${heading('Order cancelled')}
    ${paragraph(`Hi ${escapeHtml(order.customerName)},`)}
    ${dangerNotice('Cancellation Confirmed', `Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been cancelled. Any payment made will be refunded to your original payment method within 5–7 working days.`)}
    ${sectionTitle('Order Summary')}
    ${orderItemsTable(order.items || [], order.currency || 'INR')}
    ${mutedNote(`If you have questions about this cancellation, reply to this email or call us at ${escapeHtml(BRAND.phone)}.`)}
  `;
  return emailLayout('Order cancelled', html);
}

export function retailPasswordResetEmail(name: string, otp: string) {
  const html = `
    <div style="text-align:center;padding:8px 0;">
      ${heading('Reset your password')}
      ${paragraph(`Hi ${escapeHtml(name || 'there')},<br><br>We received a request to reset your password. Use the secure code below to proceed.`)}
      <div style="background:${COLORS.background};border:1px solid ${COLORS.border};border-radius:12px;padding:24px;margin:20px auto;max-width:280px;">
        <p style="font-size:34px;font-weight:700;color:${COLORS.primary};letter-spacing:10px;margin:0;font-family:'Courier New',monospace;">${escapeHtml(otp)}</p>
      </div>
      ${mutedNote('This code expires in 10 minutes. If you did not request a password reset, you can safely ignore this email.')}
    </div>
  `;
  return emailLayout('Reset your password', html);
}

export function retailPasswordResetSuccessEmail(name: string) {
  const html = `
    ${heading('Password reset successful')}
    ${paragraph(`Hi ${escapeHtml(name || 'there')},<br><br>Your password has been successfully updated. You can now sign in with your new password.`)}
    ${buttonRow(buttonPrimary(`${BRAND.storefrontUrl}`, 'Sign In'))}
    ${mutedNote('If you did not reset your password, please contact our support team immediately.')}
  `;
  return emailLayout('Password reset successful', html);
}

export function retailVerifyEmailEmail(name: string, verificationUrl: string) {
  const html = `
    ${heading('Verify your email address')}
    ${paragraph(`Hi ${escapeHtml(name || 'there')},<br><br>Thank you for creating an account with Lepakshi Spices. Please confirm your email address to get started.`)}
    ${buttonRow(buttonPrimary(verificationUrl, 'Verify Email Address'))}
    ${mutedNote('This link expires in 10 minutes. If you did not create an account, you can safely ignore this email.')}
  `;
  return emailLayout('Verify your email', html);
}

export function retailEmailAlreadyVerifiedEmail(name: string) {
  const html = `
    ${heading('Email already verified')}
    ${paragraph(`Hi ${escapeHtml(name || 'there')},<br><br>Your email address is already verified on your Lepakshi Spices account. No further action is needed.`)}
    ${buttonRow(buttonPrimary(`${BRAND.storefrontUrl}`, 'Continue Shopping'))}
  `;
  return emailLayout('Email already verified', html);
}

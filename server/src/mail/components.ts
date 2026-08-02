// ---------------------------------------------------------------------------
// Reusable, responsive HTML email building blocks for Lepakshi Spices.
// Every template composes these primitives so no HTML is duplicated.
// ---------------------------------------------------------------------------

export const BRAND = {
  name: 'Lepakshi Spices',
  tagline: 'Premium Quality Spices',
  website: 'https://lepakshispices.in',
  storefrontUrl: 'https://lepakshi-spices-user.vercel.app',
  email: 'lepakshispices@gmail.com',
  phone: '+91 79952 19657',
  phoneHref: 'tel:+917995219657',
  whatsappNumber: '917995219657',
  whatsappHref: 'https://wa.me/917995219657',
};

export const COLORS = {
  primary: '#2A4A3C',
  primaryDark: '#1A3A0A',
  gold: '#C9920A',
  goldSoft: '#FEF3E2',
  background: '#FAF8F3',
  card: '#FFFFFF',
  text: '#1A1714',
  textSoft: '#3d3832',
  muted: '#7A7064',
  border: '#E7E1D6',
  greenFaint: '#EBF5E6',
  greenBorder: '#D2E7C4',
  greenText: '#2D5016',
  warnBg: '#FFF9E6',
  warnBorder: '#FFEBAA',
  warnText: '#856404',
  dangerBg: '#FDECEA',
  dangerText: '#C94040',
  infoBg: '#E8F2FE',
  infoText: '#1B5EAD',
};

export function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]!));
}

export function formatMoney(amount: number | string, currency = 'INR') {
  const num = Number(amount || 0);
  if (currency === 'INR') return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(num);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function buttonBase(url: string, label: string, background: string, textColor = '#ffffff') {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display:inline-block;background-color:${background};color:${textColor};padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;line-height:1.2;mso-padding-alt:0;text-align:center;box-sizing:border-box;">${escapeHtml(label)}</a>`;
}

export function buttonPrimary(url: string, label: string) {
  return buttonBase(url, label, COLORS.primary);
}

export function buttonSecondary(url: string, label: string) {
  return buttonBase(url, label, COLORS.gold);
}

export function buttonOutline(url: string, label: string) {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display:inline-block;background-color:transparent;color:${COLORS.primary};border:2px solid ${COLORS.primary};padding:12px 26px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;line-height:1.2;text-align:center;box-sizing:border-box;">${escapeHtml(label)}</a>`;
}

export function buttonRow(...buttons: string[]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td align="center"><div style="display:inline-block;">${buttons
    .map((b, i) => `<div style="display:inline-block;margin:${i === 0 ? '0 6px 6px 0' : '0 0 6px 6px'};">${b}</div>`)
    .join('')}</div></td></tr></table>`;
}

export function infoBlock(title: string, body: string, bg: string, border: string, color: string) {
  return `<div style="background-color:${bg};border:1px solid ${border};border-radius:12px;padding:16px;margin:20px 0;color:${color};font-size:14px;line-height:1.6;text-align:left;">${body}</div>`;
}

export function successNotice(title: string, body: string) {
  return infoBlock(title, `<strong>${escapeHtml(title)}</strong><br>${body}`, COLORS.greenFaint, COLORS.greenBorder, COLORS.greenText);
}

export function warningNotice(title: string, body: string) {
  return infoBlock(title, `<strong>${escapeHtml(title)}</strong><br>${body}`, COLORS.warnBg, COLORS.warnBorder, COLORS.warnText);
}

export function dangerNotice(title: string, body: string) {
  return infoBlock(title, `<strong>${escapeHtml(title)}</strong><br>${body}`, COLORS.dangerBg, '#F3CFC9', COLORS.dangerText);
}

export function keyValueTable(rows: Array<{ label: string; value: string }>) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;color:${COLORS.textSoft};">
    <tbody>${rows
      .map(
        (r) =>
          `<tr><td style="padding:6px 0;font-weight:bold;width:140px;vertical-align:top;color:${COLORS.muted};">${r.label}</td><td style="padding:6px 0;vertical-align:top;color:${COLORS.text};">${r.value}</td></tr>`,
      )
      .join('')}
    </tbody></table>`;
}

export function sectionTitle(title: string) {
  return `<h3 style="border-bottom:2px solid ${COLORS.primary};padding-bottom:8px;color:${COLORS.primary};font-family:Georgia,serif;font-size:16px;text-align:left;margin:28px 0 12px;">${escapeHtml(title)}</h3>`;
}

export function paragraph(text: string) {
  return `<p style="color:${COLORS.textSoft};font-size:14px;line-height:1.7;margin:0 0 14px;">${text}</p>`;
}

export function heading(name: string) {
  return `<h2 style="color:${COLORS.text};font-size:20px;font-family:Georgia,serif;margin:0 0 12px;">${escapeHtml(name)}</h2>`;
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export function header(eyebrow?: string) {
  return `<div style="background:${COLORS.primary};padding:28px 24px;text-align:center;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="center">
      <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:${COLORS.gold};color:${COLORS.primary};font-size:24px;font-weight:800;line-height:56px;font-family:Georgia,serif;text-align:center;">LS</div>
      <h1 style="color:#ffffff;font-size:24px;margin:10px 0 2px;font-family:Georgia,serif;">${escapeHtml(BRAND.name)}</h1>
      <p style="color:#ffffff;opacity:0.8;font-size:12px;margin:0;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(eyebrow || BRAND.tagline)}</p>
    </td>
  </tr></table>
</div>`;
}

// ---------------------------------------------------------------------------
// Footer with website / email / phone / WhatsApp / copyright
// ---------------------------------------------------------------------------

export function footer() {
  const year = new Date().getFullYear();
  return `<div style="background:${COLORS.background};border-top:1px solid ${COLORS.border};padding:24px;text-align:center;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;"><tr align="center">
    <td width="25%" style="padding:6px;"><a href="${BRAND.website}" style="color:${COLORS.muted};text-decoration:none;font-size:12px;font-weight:600;">Website</a></td>
    <td width="25%" style="padding:6px;"><a href="mailto:${BRAND.email}" style="color:${COLORS.muted};text-decoration:none;font-size:12px;font-weight:600;">Email</a></td>
    <td width="25%" style="padding:6px;"><a href="${BRAND.phoneHref}" style="color:${COLORS.muted};text-decoration:none;font-size:12px;font-weight:600;">Phone</a></td>
    <td width="25%" style="padding:6px;"><a href="${BRAND.whatsappHref}" target="_blank" rel="noopener" style="color:${COLORS.muted};text-decoration:none;font-size:12px;font-weight:600;">WhatsApp</a></td>
  </tr></table>
  <p style="color:${COLORS.muted};font-size:11px;margin:0 0 4px;">${escapeHtml(BRAND.phone)} &nbsp;•&nbsp; ${escapeHtml(BRAND.email)}</p>
  <p style="color:${COLORS.muted};font-size:11px;margin:0;">&copy; ${year} ${escapeHtml(BRAND.name)}. All rights reserved.</p>
</div>`;
}

// ---------------------------------------------------------------------------
// Responsive base layout
// ---------------------------------------------------------------------------

export function emailLayout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:16px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
      <tr><td style="background:${COLORS.card};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        ${header()}
        <div style="padding:32px 24px;color:${COLORS.textSoft};text-align:left;">
          ${body}
        </div>
        ${footer()}
      </td></tr>
    </table>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Retail order product table
// ---------------------------------------------------------------------------

export type RetailOrderItem = {
  quantity: number;
  price: string;
  product?: { name?: string | null } | null;
  variant?: { label?: string | null } | null;
};

export function orderItemsTable(items: RetailOrderItem[], currency = 'INR') {
  if (!items?.length) {
    return `<p style="color:${COLORS.muted};font-size:13px;margin:8px 0;">No items.</p>`;
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;color:${COLORS.textSoft};">
  <tbody>${items
    .map(
      (item) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};">${escapeHtml(item.product?.name || item.variant?.label || 'Item')}${item.variant?.label && item.product?.name ? `<br><span style="color:${COLORS.muted};font-size:12px;">${escapeHtml(item.variant.label)}</span>` : ''}</td><td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};white-space:nowrap;color:${COLORS.muted};">x ${item.quantity}</td><td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};text-align:right;font-weight:600;white-space:nowrap;">${formatMoney(Number(item.price) * item.quantity, currency)}</td></tr>`,
    )
    .join('')}
  </tbody></table>`;
}

// ---------------------------------------------------------------------------
// Wholesale quotation product table
// ---------------------------------------------------------------------------

export type QuotationEmailItem = {
  name?: string | null;
  productName?: string | null;
  weight?: string | null;
  weightLabel?: string | null;
  quantity?: number | string | null;
  unitPrice?: number | string | null;
  discount?: number | string | null;
  discountPercent?: number | string | null;
  lineTotal?: number | string | null;
};

export function quotationItemsTable(items: QuotationEmailItem[], currency = 'INR') {
  const safe = items || [];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;color:${COLORS.textSoft};min-width:520px;">
  <thead>
    <tr style="background:${COLORS.primary};color:#ffffff;">
      <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Product</th>
      <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Variant</th>
      <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
      <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Unit Price</th>
      <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Disc</th>
      <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Line Total</th>
    </tr>
  </thead>
  <tbody>${safe
    .map((item, i) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.unitPrice || 0);
      const discPct = Number(item.discountPercent ?? item.discount ?? 0);
      const lineTotal = item.lineTotal != null && item.lineTotal !== '' ? Number(item.lineTotal) : qty * price * (1 - discPct / 100);
      const productName = item.productName || item.name || 'Product';
      const variant = item.weightLabel || item.weight || '';
      return `<tr style="background:${i % 2 === 1 ? COLORS.background : '#ffffff'};">
        <td style="padding:10px 8px;border-bottom:1px solid ${COLORS.border};font-weight:600;color:${COLORS.text};">${escapeHtml(productName)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid ${COLORS.border};">${escapeHtml(variant) || '—'}</td>
        <td style="padding:10px 8px;border-bottom:1px solid ${COLORS.border};text-align:right;white-space:nowrap;">${escapeHtml(qty)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid ${COLORS.border};text-align:right;white-space:nowrap;">${formatMoney(price, currency)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid ${COLORS.border};text-align:right;white-space:nowrap;">${discPct > 0 ? `${discPct}%` : '—'}</td>
        <td style="padding:10px 8px;border-bottom:1px solid ${COLORS.border};text-align:right;font-weight:700;color:${COLORS.primary};white-space:nowrap;">${formatMoney(lineTotal, currency)}</td>
      </tr>`;
    })
    .join('')}
  </tbody></table>`;
}

export type QuotationTotals = {
  subtotalAmount?: number | string | null;
  discountAmount?: number | string | null;
  shippingAmount?: number | string | null;
  shippingCharges?: number | string | null;
  totalAmount?: number | string | null;
  payableAmount?: number | string | null;
  currency?: string | null;
};

export function quotationTotalsBlock(totals: QuotationTotals) {
  const currency = totals.currency || 'INR';
  const subtotal = Number(totals.subtotalAmount || 0);
  const discount = Number(totals.discountAmount || 0);
  const freight = Number(totals.shippingAmount ?? totals.shippingCharges ?? 0);
  const payable = Number(totals.payableAmount ?? totals.totalAmount ?? subtotal - discount + freight);

  const row = (label: string, value: string, strong = false, extra = '') =>
    `<tr><td style="padding:7px 0;color:${COLORS.muted};font-size:13px;${strong ? `font-weight:700;color:${COLORS.text};` : ''}">${label}</td><td style="padding:7px 0;text-align:right;font-size:13px;${strong ? `font-weight:700;color:${COLORS.primary};font-size:15px;` : ''}white-space:nowrap;">${value}${extra}</td></tr>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:14px;">
  <tbody>
    ${row('Subtotal', formatMoney(subtotal, currency))}
    ${discount > 0 ? row('Discount', `− ${formatMoney(discount, currency)}`) : ''}
    ${row('Freight', formatMoney(freight, currency))}
    ${row('Final Payable', formatMoney(payable, currency), true)}
  </tbody></table>
  <p style="color:${COLORS.muted};font-size:11px;font-style:italic;margin:10px 0 0;">* All wholesale pack prices are GST inclusive. No tax is added on top.</p>`;
}

export function commercialTermsBlock(rows: Array<{ label: string; value: string }>) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;color:${COLORS.textSoft};">
  <tbody>${rows
    .map(
      (r) =>
        `<tr><td style="padding:6px 0;font-weight:bold;width:160px;vertical-align:top;color:${COLORS.muted};">${r.label}</td><td style="padding:6px 0;vertical-align:top;color:${COLORS.text};">${r.value}</td></tr>`,
    )
    .join('')}
  </tbody></table>`;
}

export function smallDivider() {
  return `<div style="height:1px;background:${COLORS.border};margin:20px 0;"></div>`;
}

export function mutedNote(text: string) {
  return `<p style="color:${COLORS.muted};font-size:12px;line-height:1.6;margin:14px 0 0;">${text}</p>`;
}

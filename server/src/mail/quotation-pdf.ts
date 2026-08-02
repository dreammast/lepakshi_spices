// ---------------------------------------------------------------------------
// Server-side quotation PDF generation (pdfkit).
// Produces a professional branded PDF matching the inline email quotation.
// ---------------------------------------------------------------------------
import PDFDocument from 'pdfkit';
import type { WholesaleQuotationData } from './templates.wholesale.js';
import { BRAND } from './components.js';

const PRIMARY: [number, number, number] = [42, 74, 60];
const GOLD: [number, number, number] = [201, 146, 10];
const MUTED: [number, number, number] = [122, 112, 100];
const TEXT: [number, number, number] = [26, 23, 20];
const LIGHT_BG: [number, number, number] = [250, 248, 245];

function quoteReference(data: WholesaleQuotationData) {
  return data.quoteNumber || `QT-${data.id}`;
}

function money(n: number | string | null | undefined) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function fmtDate(v: string | Date | null | undefined) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export type QuotationPdfResult = {
  filename: string;
  base64: string;
  contentType: string;
  size: number;
};

export async function generateQuotationPdf(data: WholesaleQuotationData): Promise<QuotationPdfResult> {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 48, bottom: 44, left: 44, right: 44 }, bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const items = (data.items || [])
    .filter((it) => it)
    .map((it) => {
      const qty = Number(it.quantity || 0);
      const price = Number(it.unitPrice || 0);
      const discPct = Number(it.discountPercent ?? it.discount ?? 0);
      const lineTotal = it.lineTotal != null && it.lineTotal !== '' ? Number(it.lineTotal) : qty * price * (1 - discPct / 100);
      return {
        name: String(it.productName || it.name || 'Product'),
        variant: String(it.weightLabel || it.weight || '—'),
        qty,
        price,
        discPct,
        lineTotal,
      };
    });

  const subtotal = Number(data.subtotalAmount ?? items.reduce((s, i) => s + i.lineTotal, 0));
  const discount = Number(data.discountAmount ?? 0);
  const freight = Number(data.shippingAmount ?? data.shippingCharges ?? 0);
  const payable = Number(data.payableAmount ?? data.totalAmount ?? Math.max(0, subtotal - discount) + freight);

  const y0 = doc.y;

  // ---- Header band ----
  doc.fillColor(PRIMARY).rect(0, 0, doc.page.width, 108).fill();
  doc.fillColor(GOLD).circle(52, 46, 18).fill();
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(16).text('LS', 45, 39, { width: 14, align: 'center' });
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text(BRAND.name, 84, 32);
  doc.font('Helvetica').fontSize(9).fillColor('#ffffff').text(BRAND.tagline.toUpperCase(), 84, 58);
  doc.font('Helvetica-Bold').fontSize(11).text('OFFICIAL QUOTATION', 44, 84);

  doc.y = 128;

  // ---- Title row ----
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(14).text('Quotation', 44, y0 + 130);
  doc.font('Helvetica').fontSize(10);
  doc.fillColor(MUTED).text(`Reference: ${quoteReference(data)}`, 44, y0 + 152);
  doc.fillColor(MUTED).text(`Date: ${fmtDate(data.createdAt)}`, 44, y0 + 164);
  doc.fillColor(MUTED).text(`Valid Until: ${fmtDate(data.validUntil)}`, 44, y0 + 176);

  let y = y0 + 192;

  // ---- Customer info card ----
  const customerLines = [
    ['Company', data.businessName || '—'],
    ['Contact Person', data.contactPerson || '—'],
    ['Email', data.email || '—'],
    ['Phone', data.phone ? `+91 ${data.phone}` : '—'],
    ['GSTIN', data.gstin || '—'],
  ].filter((pair) => pair[1] && pair[1] !== '—') as Array<[string, string]>;

  doc.fillColor(LIGHT_BG).rect(44, y, 278, customerLines.length * 13 + 22).fill();
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(9).text('CUSTOMER DETAILS', 56, y + 8);
  let cy = y + 22;
  for (const [label, value] of customerLines) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED).text(`${label}:`, 56, cy);
    doc.font('Helvetica').fillColor(TEXT).text(value, 150, cy, { width: 160 });
    cy += 13;
  }
  const rightX = 342;
  const rightY = y;
  const rightLines = [
    ['Sales Executive', data.salesExecutive || 'Lepakshi Spices Sales'],
    ['Payment Terms', data.paymentTerms || '—'],
    ['Lead Time', data.leadTimeDays != null ? `${data.leadTimeDays} days` : '—'],
    ['Packaging', data.packagingType || '—'],
    ['Delivery', data.deliveryMethod || '—'],
  ];
  doc.fillColor(LIGHT_BG).rect(rightX, rightY, doc.page.width - rightX - 44, rightLines.length * 13 + 22).fill();
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(9).text('COMMERCIAL TERMS', rightX + 12, rightY + 8);
  let rcy = rightY + 22;
  for (const [label, value] of rightLines) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED).text(`${label}:`, rightX + 12, rcy);
    doc.font('Helvetica').fillColor(TEXT).text(value, rightX + 82, rcy, { width: doc.page.width - rightX - 82 - 56 });
    rcy += 13;
  }

  y = Math.max(rightY + rightLines.length * 13 + 34, cy + 20);

  // ---- Items table ----
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(11).text('Products', 44, y);
  y += 16;

  const tableLeft = 44;
  const tableWidth = doc.page.width - 88;
  const colProduct = tableLeft;
  const colVariant = colProduct + tableWidth * 0.24;
  const colQty = colVariant + tableWidth * 0.12;
  const colPrice = colQty + tableWidth * 0.18;
  const colDisc = colPrice + tableWidth * 0.14;
  const colTotal = colDisc + tableWidth * 0.18;
  const colEnd = colTotal + tableWidth * 0.14;
  const headerRowH = 18;
  const rowH = 20;

  const drawHeader = () => {
    doc.fillColor(PRIMARY).rect(tableLeft, y, tableWidth, headerRowH).fill();
    const labels: Array<[number, string]> = [
      [colProduct, 'PRODUCT'],
      [colVariant, 'VARIANT'],
      [colQty, 'QTY'],
      [colPrice, 'UNIT PRICE'],
      [colDisc, 'DISC'],
      [colTotal, 'LINE TOTAL'],
    ];
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5);
    for (const [x, l] of labels) doc.text(l, x + 4, y + 6, { width: 74, ellipsis: true });
    y += headerRowH;
  };
  drawHeader();

  for (let i = 0; i < items.length; i++) {
    if (y + rowH > doc.page.height - 90) {
      doc.addPage();
      y = 48;
      drawHeader();
    }
    if (i % 2 === 1) doc.fillColor([250, 249, 247]).rect(tableLeft, y, tableWidth, rowH).fill();
    doc.strokeColor('#e2ded8').lineWidth(0.4).rect(tableLeft, y, tableWidth, rowH).stroke();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(TEXT).text(items[i].name, colProduct + 4, y + 7, { width: colVariant - colProduct - 8, ellipsis: true });
    doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(items[i].variant, colVariant + 4, y + 7, { width: colQty - colVariant - 8, ellipsis: true });
    doc.text(String(items[i].qty), colQty + 4, y + 7, { width: colPrice - colQty - 8, align: 'right' });
    doc.fillColor(TEXT).text(money(items[i].price), colPrice + 4, y + 7, { width: colDisc - colPrice - 8, align: 'right' });
    doc.fillColor(MUTED).text(items[i].discPct > 0 ? `${items[i].discPct}%` : '—', colDisc + 4, y + 7, { width: colTotal - colDisc - 8, align: 'right' });
    doc.font('Helvetica-Bold').fillColor(PRIMARY).text(money(items[i].lineTotal), colTotal + 4, y + 7, { width: colEnd - colTotal - 8, align: 'right' });
    y += rowH;
  }

  // ---- Totals panel ----
  y += 16;
  const totalsLeft = doc.page.width - 44 - 180;
  const totalsRight = doc.page.width - 44;
  const totals = [
    ['Subtotal', money(subtotal)],
    ...(discount > 0 ? [['Discount', `− ${money(discount)}`]] : []),
    ['Freight', money(freight)],
    ['Final Payable', money(payable)],
  ] as Array<[string, string]>;

  const totalsHeight = totals.length * 16 + 12;
  doc.fillColor(LIGHT_BG).rect(totalsLeft, y - 6, totalsRight - totalsLeft, totalsHeight).fill();
  let ty = y;
  for (const [label, value] of totals) {
    const bold = label === 'Final Payable';
    const color = bold ? PRIMARY : MUTED;
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 11 : 9).fillColor(color);
    doc.text(label, totalsLeft + 12, ty);
    doc.text(value, totalsLeft + 12, ty, { width: totalsRight - totalsLeft - 24, align: 'right' });
    ty += 16;
  }

  doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(MUTED).text('* All wholesale pack prices are GST inclusive. No tax added.', totalsLeft + 12, ty + 2, { width: totalsRight - totalsLeft - 24, align: 'right' });
  y = ty + 22;

  // ---- Terms & notes ----
  if (data.termsList?.length) {
    doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(11).text('Terms & Conditions', 44, y);
    y += 14;
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED);
    for (const t of data.termsList) {
      doc.text(`•  ${t}`, 44, y, { width: doc.page.width - 88 });
      y = doc.y + 3;
    }
    y += 6;
  }
  if (data.notes) {
    doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(11).text('Negotiation Notes', 44, y);
    y += 14;
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(data.notes, 44, y, { width: doc.page.width - 88 });
    y = doc.y + 6;
  }

  // ---- Sign-off block ----
  y = Math.max(y + 12, doc.page.height - 96);
  doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(
    `For ${BRAND.name}, ${BRAND.website}  •  ${BRAND.phone}  •  ${BRAND.email}`,
    44,
    y,
    { width: doc.page.width - 88, align: 'center' },
  );
  doc.text('Authorised Signatory  ______________________________________', 44, y + 14, { width: doc.page.width - 88, align: 'right' });

  // ---- Footer on every page ----
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(7.5).fillColor(MUTED).text(`Page ${i + 1} of ${pageCount}`, 44, doc.page.height - 30, { width: doc.page.width - 88, align: 'center' });
  }

  doc.end();
  const buffer = await finished;

  const safeName = String(data.businessName || 'Client').trim().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  return {
    filename: `Lepakshi_Spices_Quotation_${quoteReference(data)}_${safeName}.pdf`,
    base64: buffer.toString('base64'),
    contentType: 'application/pdf',
    size: buffer.length,
  };
}

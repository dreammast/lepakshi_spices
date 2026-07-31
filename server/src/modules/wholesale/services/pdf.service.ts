import PDFDocument from 'pdfkit';
import type { Response } from 'express';

// ---------------------------------------------------------------------------
// Wholesale PDF Generation Service
//
// Generates professional quotation PDFs using live database data and pdfkit.
// Margins, grids, colors, and layout are structured for visual excellence.
// ---------------------------------------------------------------------------

function formatCurrency(amount: number | string | null | undefined): string {
  const parsed = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(parsed);
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const parsed = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(parsed.getTime())) return 'N/A';
  return parsed.toISOString().slice(0, 10);
}

export function generateQuotationPdf(quotation: any, res: Response): void {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true,
  });

  // Pipe output directly to express response stream
  doc.pipe(res);

  // Colors
  const primaryColor = '#2A4A3C';  // Lepakshi dark green
  const accentColor = '#C9920A';   // Gold
  const textColor = '#3D3832';     // Dark neutral
  const lightBg = '#FAF8F3';       // Off-white
  const borderLight = '#EAE8E4';   // Border color

  // Header Banner
  doc.rect(50, 45, 495, 65).fill(primaryColor);
  
  // Brand Name
  doc.fillColor(accentColor)
     .fontSize(22)
     .font('Times-Bold')
     .text('Lepakshi Spices', 70, 58);
     
  doc.fillColor('#FFFFFF')
     .fontSize(8)
     .font('Helvetica-Oblique')
     .text('Premium Quality Indian Spices & Blends', 70, 84);

  // Title
  doc.fillColor('#FFFFFF')
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('QUOTATION', 400, 68, { align: 'right', width: 120 });

  // ----------------- Metadata Section -----------------
  let y = 130;
  doc.fillColor(textColor).font('Helvetica-Bold').fontSize(10);
  doc.text('Quotation Details', 50, y);
  doc.text('Client Details', 300, y);

  // Draw separator line
  doc.moveTo(50, y + 14).lineTo(545, y + 14).strokeColor(borderLight).lineWidth(1).stroke();

  y += 24;
  doc.font('Helvetica').fontSize(9).fillColor('#7A7064');
  
  // Column 1: Details
  doc.text('Quote Number:', 50, y);
  doc.font('Helvetica-Bold').fillColor(textColor).text(quotation.quoteNumber, 130, y);
  
  doc.font('Helvetica').fillColor('#7A7064').text('Quote Date:', 50, y + 14);
  doc.font('Helvetica-Bold').fillColor(textColor).text(formatDate(quotation.createdAt), 130, y + 14);
  
  doc.font('Helvetica').fillColor('#7A7064').text('Valid Until:', 50, y + 28);
  doc.font('Helvetica-Bold').fillColor(textColor).text(formatDate(quotation.validUntil), 130, y + 28);

  doc.font('Helvetica').fillColor('#7A7064').text('Revision No:', 50, y + 42);
  doc.font('Helvetica-Bold').fillColor(textColor).text(`v${quotation.revisionNumber}`, 130, y + 42);

  // Column 2: Client Info
  doc.font('Helvetica-Bold').fillColor(textColor).text(quotation.companyName || 'N/A', 300, y);
  doc.font('Helvetica').fillColor('#7A7064');
  doc.text(`Contact: ${quotation.contactName || 'N/A'}`, 300, y + 14);
  doc.text(`Email: ${quotation.email || 'N/A'}`, 300, y + 26);
  if (quotation.phone) {
    doc.text(`Phone: ${quotation.phone}`, 300, y + 38);
  }
  if (quotation.gstin) {
    doc.font('Helvetica-Bold').fillColor(textColor).text(`GSTIN: ${quotation.gstin}`, 300, y + 50);
  }

  y += 75;

  // Address blocks
  doc.fillColor(textColor).font('Helvetica-Bold').fontSize(10).text('Billing Address', 50, y);
  doc.text('Shipping Address', 300, y);
  doc.moveTo(50, y + 14).lineTo(545, y + 14).strokeColor(borderLight).stroke();

  y += 20;
  doc.font('Helvetica').fontSize(9).fillColor('#7A7064');
  doc.text(quotation.billingAddress || 'Same as shipping', 50, y, { width: 220, lineGap: 2 });
  doc.text(quotation.shippingAddress || 'N/A', 300, y, { width: 220, lineGap: 2 });

  y += 55;

  // ----------------- Table of Items -----------------
  doc.fillColor(textColor).font('Helvetica-Bold').fontSize(10).text('Quoted Line Items', 50, y);
  y += 16;

  // Table Headers
  doc.rect(50, y, 495, 20).fill(lightBg);
  doc.fillColor(textColor).font('Helvetica-Bold').fontSize(8.5);
  doc.text('#', 55, y + 6);
  doc.text('Product Name', 80, y + 6);
  doc.text('Pack', 230, y + 6);
  doc.text('Qty', 290, y + 6, { align: 'right', width: 30 });
  doc.text('Unit Price', 330, y + 6, { align: 'right', width: 55 });
  doc.text('Disc %', 395, y + 6, { align: 'right', width: 35 });
  doc.text('GST %', 440, y + 6, { align: 'right', width: 35 });
  doc.text('Line Total', 485, y + 6, { align: 'right', width: 55 });

  y += 20;
  doc.font('Helvetica').fontSize(8.5);

  const items = quotation.items || [];
  items.forEach((item: any, idx: number) => {
    // Alternating background or simple borders
    if (idx % 2 === 1) {
      doc.rect(50, y, 495, 18).fill('#FAF8F6');
    }
    doc.fillColor(textColor);
    doc.text(String(idx + 1), 55, y + 5);
    doc.text(item.productName || 'Item', 80, y + 5, { width: 140, height: 12, ellipsis: true });
    doc.text(item.weightLabel || '1kg', 230, y + 5);
    doc.text(String(Number(item.quantity)), 290, y + 5, { align: 'right', width: 30 });
    doc.text(formatCurrency(item.unitPrice), 330, y + 5, { align: 'right', width: 55 });
    doc.text(`${Number(item.discountPercent || 0)}%`, 395, y + 5, { align: 'right', width: 35 });
    doc.text(`${Number(item.taxPercent || 0)}%`, 440, y + 5, { align: 'right', width: 35 });
    doc.font('Helvetica-Bold').text(formatCurrency(item.lineTotal), 485, y + 5, { align: 'right', width: 55 }).font('Helvetica');

    y += 18;
  });

  // Border bottom for table
  doc.moveTo(50, y).lineTo(545, y).strokeColor(borderLight).lineWidth(1).stroke();
  y += 15;

  // ----------------- Summary & Details -----------------
  // Keep on same page if space permits, or let page-break handle it
  if (y > 600) {
    doc.addPage();
    y = 50;
  }

  // Left side: terms, delivery and payment notes
  const leftY = y;
  doc.fillColor(textColor).font('Helvetica-Bold').fontSize(9).text('Terms & Conditions', 50, leftY);
  doc.moveTo(50, leftY + 12).lineTo(250, leftY + 12).strokeColor(borderLight).stroke();

  doc.font('Helvetica').fontSize(8).fillColor('#7A7064');
  doc.text(`Payment Terms: ${quotation.paymentTerms || 'Standard B2B Terms'}`, 50, leftY + 20, { width: 200 });
  doc.text(`Delivery Method: ${quotation.deliveryMethod || 'Freight / Transport'}`, 50, leftY + 32, { width: 200 });
  if (quotation.deliveryTerms) {
    doc.text(`Delivery Terms: ${quotation.deliveryTerms}`, 50, leftY + 44, { width: 200 });
  }
  if (quotation.notes) {
    doc.text(`Notes: ${quotation.notes}`, 50, leftY + 60, { width: 200 });
  }

  // Right side: summary numbers (recalculated on backend only)
  let rightY = y;
  doc.fillColor(textColor).font('Helvetica-Bold').fontSize(9).text('Calculation Summary', 340, rightY);
  doc.moveTo(340, rightY + 12).lineTo(545, rightY + 12).strokeColor(borderLight).stroke();

  rightY += 20;
  doc.font('Helvetica').fontSize(8.5).fillColor('#7A7064');
  
  doc.text('Base Subtotal Amount:', 340, rightY);
  doc.font('Helvetica-Bold').fillColor(textColor).text(formatCurrency(quotation.subtotalAmount), 460, rightY, { align: 'right', width: 80 });

  doc.font('Helvetica').fillColor('#7A7064').text('Discount Deducted:', 340, rightY + 14);
  doc.font('Helvetica-Bold').fillColor(textColor).text(`- ${formatCurrency(quotation.discountAmount)}`, 460, rightY + 14, { align: 'right', width: 80 });

  doc.font('Helvetica').fillColor('#7A7064').text('GST Tax Amount:', 340, rightY + 28);
  doc.font('Helvetica-Bold').fillColor(textColor).text(`+ ${formatCurrency(quotation.taxAmount)}`, 460, rightY + 28, { align: 'right', width: 80 });

  doc.font('Helvetica').fillColor('#7A7064').text('Freight Charges:', 340, rightY + 42);
  doc.font('Helvetica-Bold').fillColor(textColor).text(`+ ${formatCurrency(quotation.shippingAmount)}`, 460, rightY + 42, { align: 'right', width: 80 });

  if (Number(quotation.additionalCharges) > 0) {
    doc.font('Helvetica').fillColor('#7A7064').text('Additional Charges:', 340, rightY + 56);
    doc.font('Helvetica-Bold').fillColor(textColor).text(`+ ${formatCurrency(quotation.additionalCharges)}`, 460, rightY + 56, { align: 'right', width: 80 });
    rightY += 14;
  }

  // Draw Grand Total Box
  rightY += 60;
  doc.rect(340, rightY - 8, 205, 24).fill(primaryColor);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
  doc.text('GRAND TOTAL:', 348, rightY);
  doc.text(formatCurrency(quotation.totalAmount), 450, rightY, { align: 'right', width: 90 });

  // Signature lines or thanks message
  doc.fontSize(8).fillColor('#7A7064').font('Helvetica-Oblique').text('Thank you for choosing Lepakshi Spices!', 50, 720, { align: 'center', width: 495 });

  doc.end();
}

import { db } from '../../../config/database.js';
import { products, productVariants } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Centralized Wholesale Pricing Service
//
// Performs all calculations on the backend.
// Master price is stored on products.basePrice (for 1kg).
// Variant pricing is basePrice * (weightGrams / 1000) unless negotiated.
// ---------------------------------------------------------------------------

export function parseWeightToGrams(label?: string | null): number {
  if (!label) return 1000;
  const cleaned = label.trim().toLowerCase();
  const kgMatch = cleaned.match(/^([\d.]+)\s*kg$/);
  if (kgMatch) {
    return parseFloat(kgMatch[1]) * 1000;
  }
  const gMatch = cleaned.match(/^([\d.]+)\s*g$/);
  if (gMatch) {
    return parseFloat(gMatch[1]);
  }
  const gramsMatch = cleaned.match(/^([\d.]+)\s*grams$/);
  if (gramsMatch) {
    return parseFloat(gramsMatch[1]);
  }
  return 1000;
}

export interface CalculatedLineItem {
  productVariantId?: number;
  productName: string;
  weightLabel: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  lineTotal: number;
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
}

/**
 * Calculate pricing for a single wholesale line item.
 * Recalculates unit price from DB base price if no negotiated price is passed.
 */
export async function calculateWholesaleItemLine(item: {
  productVariantId?: number;
  productName: string;
  weightLabel?: string;
  quantity: number;
  unitPrice?: number | string; // negotiated price if set
  discountPercent?: number | string;
  taxPercent?: number | string;
}): Promise<CalculatedLineItem> {
  let resolvedPrice = 0;
  let weightGrams = 1000;
  let basePrice = 0;
  let label = item.weightLabel || '1kg';
  
  if (item.productVariantId) {
    const [row] = await db
      .select({
        product: products,
        variant: productVariants
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(productVariants.id, item.productVariantId));
    if (row) {
      basePrice = Number(row.product.basePrice);
      weightGrams = row.variant.weightGrams || 1000;
      resolvedPrice = basePrice * (weightGrams / 1000);
      label = row.variant.label || `${weightGrams / 1000}kg`;
    }
  } else {
    weightGrams = parseWeightToGrams(item.weightLabel);
  }

  const reqUnitPrice = Number(item.unitPrice);
  const finalUnitPrice = (reqUnitPrice > 0) ? reqUnitPrice : resolvedPrice;

  const quantity = Number(item.quantity);
  const discountPercent = Number(item.discountPercent || 0);
  const taxPercent = Number(item.taxPercent || 0);

  const grossAmount = quantity * finalUnitPrice;
  const discountAmount = grossAmount * (discountPercent / 100);
  const taxableAmount = grossAmount - discountAmount;
  const taxAmount = taxableAmount * (taxPercent / 100);
  const lineTotal = taxableAmount + taxAmount;

  return {
    productVariantId: item.productVariantId,
    productName: item.productName,
    weightLabel: label,
    quantity,
    unitPrice: Math.round(finalUnitPrice * 100) / 100,
    discountPercent,
    taxPercent,
    lineTotal: Math.round(lineTotal * 100) / 100,
    grossAmount: Math.round(grossAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
  };
}

export interface WholesaleQuotationSummary {
  subtotalAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  shippingAmount: number;
  additionalCharges: number;
  totalAmount: number;
}

/**
 * Calculates overall summary totals for a quotation.
 */
export function calculateQuotationSummary(
  items: Array<{ grossAmount: number; discountAmount: number; taxAmount: number }>,
  shippingAmount = 0,
  additionalCharges = 0,
): WholesaleQuotationSummary {
  let subtotalAmount = 0;
  let discountAmount = 0;
  let taxAmount = 0;

  for (const item of items) {
    subtotalAmount += item.grossAmount;
    discountAmount += item.discountAmount;
    taxAmount += item.taxAmount;
  }

  const taxableAmount = subtotalAmount - discountAmount;
  const totalAmount = taxableAmount + taxAmount + shippingAmount + additionalCharges;

  return {
    subtotalAmount: Math.round(subtotalAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    shippingAmount: Math.round(shippingAmount * 100) / 100,
    additionalCharges: Math.round(additionalCharges * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

export function formatWholesaleAmount(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

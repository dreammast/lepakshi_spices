// ---------------------------------------------------------------------------
// Centralized Wholesale Pricing Service
//
// All wholesale pricing calculations go through this module so that
// quotations, invoices, emails, and reports use consistent math.
// Currently wraps the existing "manual entry" approach. Extend this
// with tier/volume-based rules in the future without touching callers.
// ---------------------------------------------------------------------------

/**
 * Calculate the total for a single line item.
 *
 * lineTotal = (quantity × unitPrice) × (1 − discountPercent/100) × (1 + taxPercent/100)
 */
export function calculateLineTotal(
  quantity: number,
  unitPrice: number,
  discountPercent = 0,
  taxPercent = 0,
): number {
  const gross = quantity * unitPrice;
  const afterDiscount = gross * (1 - discountPercent / 100);
  const afterTax = afterDiscount * (1 + taxPercent / 100);
  return Math.round(afterTax * 100) / 100;
}

export interface QuotationTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

/**
 * Calculate aggregate totals from an array of line items.
 */
export function calculateQuotationTotals(
  items: Array<{ quantity: number; unitPrice: number; discountPercent?: number; taxPercent?: number }>,
): QuotationTotals {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const item of items) {
    const gross = item.quantity * item.unitPrice;
    const discount = gross * ((item.discountPercent ?? 0) / 100);
    const afterDiscount = gross - discount;
    const tax = afterDiscount * ((item.taxPercent ?? 0) / 100);

    subtotal += gross;
    discountTotal += discount;
    taxTotal += tax;
  }

  const grandTotal = subtotal - discountTotal + taxTotal;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

/**
 * Format a monetary amount for display using the Indian locale.
 */
export function formatWholesaleAmount(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

import { db } from '../../../config/database.js';
import {
  wholesaleInquiries,
  wholesaleOrders,
  wholesaleInvoices,
  quotations,
  wholesaleActivityLog,
} from '../../../db/schema.js';
import { count, sql, desc, eq } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Wholesale Dashboard Statistics
//
// Provides aggregate wholesale stats for the admin dashboard. This keeps
// wholesale-specific queries inside the module boundary instead of the
// shared dashboard controller.
// ---------------------------------------------------------------------------

export interface WholesaleStats {
  totalLeads: number;
  activeLeads: number;
  totalOrders: number;
  activeOrders: number;
  totalInvoices: number;
  pendingInvoices: number;
  totalQuotations: number;
  activeQuotations: number;
  wholesaleRevenue: number;
  recentActivity: Array<any>;
}

export async function getWholesaleStats(): Promise<WholesaleStats> {
  const [
    leadsResult,
    ordersResult,
    invoicesResult,
    quotesResult,
    revenueResult,
    activityResult,
  ] = await Promise.all([
    // Leads
    db.select({
      leadCount: count(),
      activeLeadCount: sql<number>`sum(case when ${wholesaleInquiries.status} in ('new', 'reviewing') then 1 else 0 end)`,
    }).from(wholesaleInquiries).then(res => res[0]),

    // Orders
    db.select({
      orderCount: count(),
      activeOrderCount: sql<number>`sum(case when ${wholesaleOrders.status} in ('pending', 'confirmed', 'processing', 'shipped') then 1 else 0 end)`,
    }).from(wholesaleOrders).then(res => res[0]),

    // Invoices
    db.select({
      invoiceCount: count(),
      pendingInvoiceCount: sql<number>`sum(case when ${wholesaleInvoices.status} in ('draft', 'sent') then 1 else 0 end)`,
    }).from(wholesaleInvoices).then(res => res[0]),

    // Quotations
    db.select({
      quoteCount: count(),
      activeQuoteCount: sql<number>`sum(case when ${quotations.status} in ('draft', 'sent', 'accepted') then 1 else 0 end)`,
    }).from(quotations).then(res => res[0]),

    // Revenue from paid invoices
    db.select({
      totalRevenueVal: sql<number>`sum(cast(${wholesaleInvoices.totalAmount} as decimal(12,2)))`,
    }).from(wholesaleInvoices).where(eq(wholesaleInvoices.status, 'paid')).then(res => res[0]),

    // Recent activity log feed
    db.select().from(wholesaleActivityLog).orderBy(desc(wholesaleActivityLog.createdAt)).limit(5),
  ]);

  return {
    totalLeads: Number(leadsResult?.leadCount || 0),
    activeLeads: Number(leadsResult?.activeLeadCount || 0),
    totalOrders: Number(ordersResult?.orderCount || 0),
    activeOrders: Number(ordersResult?.activeOrderCount || 0),
    totalInvoices: Number(invoicesResult?.invoiceCount || 0),
    pendingInvoices: Number(invoicesResult?.pendingInvoiceCount || 0),
    totalQuotations: Number(quotesResult?.quoteCount || 0),
    activeQuotations: Number(quotesResult?.activeQuoteCount || 0),
    wholesaleRevenue: Number(revenueResult?.totalRevenueVal || 0),
    recentActivity: activityResult || [],
  };
}

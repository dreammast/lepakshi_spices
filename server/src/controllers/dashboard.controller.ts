import type { Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import {
  orders, products, productVariants, customerProfiles,
  coupons, recipes, reviews, wholesaleInquiries, categories
} from '../db/schema.js';
import { sql, eq, and, gte, lt, count } from 'drizzle-orm';
import { sendSuccess } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function getDashboardStatsController(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 86400000);

    // ── Core counts ─────────────────────────────────────────────
    const [
      allOrders,
      allProducts,
      allCustomers,
      allCoupons,
      allRecipes,
      allReviews,
      allLeads,
      allCategories,
    ] = await Promise.all([
      db.select().from(orders),
      db.select().from(products),
      db.select({ id: customerProfiles.id }).from(customerProfiles).where(eq(customerProfiles.role, 'customer')),
      db.select().from(coupons),
      db.select({ id: recipes.id, status: recipes.status }).from(recipes),
      db.select({ id: reviews.id, status: reviews.status }).from(reviews),
      db.select({ id: wholesaleInquiries.id, status: wholesaleInquiries.status }).from(wholesaleInquiries),
      db.select({ id: categories.id, name: categories.name }).from(categories),
    ]);

    // ── Low stock: count products that have at least one variant below threshold ─
    const allVariants = await db.select().from(productVariants);
    const variantsByProduct = new Map<number, typeof allVariants>();
    for (const v of allVariants) {
      const arr = variantsByProduct.get(v.productId) ?? [];
      arr.push(v);
      variantsByProduct.set(v.productId, arr);
    }
    const lowStockProducts = allProducts.filter(p => {
      const variants = variantsByProduct.get(p.id) ?? [];
      return variants.length > 0 && variants.some(v => v.stock <= v.lowStockThreshold);
    }).length;

    // ── Today / Yesterday orders ─────────────────────────────────
    const todayOrders = allOrders.filter(o => new Date(o.placedAt) >= startOfToday);
    const yesterdayOrders = allOrders.filter(o => new Date(o.placedAt) >= startOfYesterday && new Date(o.placedAt) < startOfToday);

    const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + Number(o.totalAmount), 0);

    const totalRevenue = allOrders.reduce((s, o) => s + Number(o.totalAmount), 0);

    const pendingOrders = allOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const activeLeads = allLeads.filter(i => i.status === 'new' || i.status === 'reviewing').length;
    const activeCoupons = allCoupons.filter(c => c.isActive).length;
    const publishedRecipes = allRecipes.filter(r => r.status === 'published').length;
    const pendingReviews = allReviews.filter(r => r.status === 'pending').length;

    // ── Monthly revenue & orders (last 12 months) ────────────────
    const monthlyData: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const monthOrders = allOrders.filter(o => {
        const placed = new Date(o.placedAt);
        return placed >= d && placed < nextD;
      });
      monthlyData.push({
        month: MONTHS[d.getMonth()],
        revenue: monthOrders.reduce((s, o) => s + Number(o.totalAmount), 0),
        orders: monthOrders.length,
      });
    }

    // ── Category split (product count per category) ───────────────
    const catCountMap = new Map<string, number>();
    for (const p of allProducts) {
      const cat = allCategories.find(c => c.id === p.categoryId);
      const name = cat?.name ?? 'Uncategorized';
      catCountMap.set(name, (catCountMap.get(name) ?? 0) + 1);
    }
    const totalProductsForSplit = allProducts.length || 1;
    const categoryData = Array.from(catCountMap.entries()).map(([name, count]) => ({
      name,
      value: Math.round((count / totalProductsForSplit) * 100),
    }));

    // ── Revenue deltas ─────────────────────────────────────────────
    const revenueDelta = yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 1000) / 10
      : 0;
    const ordersCountDelta = yesterdayOrders.length > 0
      ? Math.round(((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 1000) / 10
      : 0;

    // ── Recent orders (last 5) ────────────────────────────────────
    const recentOrders = allOrders
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: Number(o.totalAmount),
        status: o.status,
        placedAt: o.placedAt,
      }));

    sendSuccess(res, {
      // KPI stats
      totalOrders: allOrders.length,
      todayOrders: todayOrders.length,
      todayRevenue,
      yesterdayRevenue,
      totalRevenue,
      pendingOrders,
      totalCustomers: allCustomers.length,
      totalProducts: allProducts.length,
      lowStockProducts,
      totalCoupons: allCoupons.length,
      activeCoupons,
      totalRecipes: allRecipes.length,
      publishedRecipes,
      totalReviews: allReviews.length,
      pendingReviews,
      totalWholesaleLeads: allLeads.length,
      activeWholesaleLeads: activeLeads,
      // Deltas (%)
      revenueChangePct: revenueDelta,
      ordersChangePct: ordersCountDelta,
      // Chart data
      monthlyData,
      categoryData,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
}

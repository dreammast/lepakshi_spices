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

    // ── Optimized Aggregates ─────────────────────────────────────
    const [
      { orderCount, totalRevenueVal },
      { productCount },
      { customerCount },
      { couponCount, activeCouponCount },
      { recipeCount, publishedRecipeCount },
      { reviewCount, pendingReviewCount },
      { leadCount, activeLeadCount },
      allCategories,
      allProducts,
      recentOrders,
    ] = await Promise.all([
      db.select({ 
        orderCount: count(), 
        totalRevenueVal: sql<number>`sum(cast(${orders.totalAmount} as decimal(12,2)))` 
      }).from(orders).then(res => res[0]),
      db.select({ productCount: count() }).from(products).then(res => res[0]),
      db.select({ customerCount: count() }).from(customerProfiles).where(eq(customerProfiles.role, 'customer')).then(res => res[0]),
      db.select({ 
        couponCount: count(),
        activeCouponCount: sql<number>`sum(case when ${coupons.isActive} = 1 then 1 else 0 end)`
      }).from(coupons).then(res => res[0]),
      db.select({ 
        recipeCount: count(),
        publishedRecipeCount: sql<number>`sum(case when ${recipes.status} = 'published' then 1 else 0 end)`
      }).from(recipes).then(res => res[0]),
      db.select({ 
        reviewCount: count(),
        pendingReviewCount: sql<number>`sum(case when ${reviews.status} = 'pending' then 1 else 0 end)`
      }).from(reviews).then(res => res[0]),
      db.select({ 
        leadCount: count(),
        activeLeadCount: sql<number>`sum(case when ${wholesaleInquiries.status} in ('new', 'reviewing') then 1 else 0 end)`
      }).from(wholesaleInquiries).then(res => res[0]),
      db.select({ id: categories.id, name: categories.name }).from(categories),
      db.select({ id: products.id }).from(products),
      db.select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        total: orders.totalAmount,
        status: orders.status,
        placedAt: orders.placedAt,
      }).from(orders).orderBy(sql`${orders.placedAt} desc`).limit(5)
    ]);

    // ── Low stock: count products that have at least one variant below threshold ─
    const lowStockResult = await db.select({ count: sql<number>`count(distinct ${productVariants.productId})` })
      .from(productVariants)
      .where(sql`${productVariants.stock} <= ${productVariants.lowStockThreshold}`);
    const lowStockProducts = Number(lowStockResult[0]?.count || 0);

    // ── Today / Yesterday / Pending ──────────────────────────────
    const [
      { todayCount, todayRev },
      { yesterdayCount, yesterdayRev },
      { pendingCount }
    ] = await Promise.all([
      db.select({ 
        todayCount: count(), 
        todayRev: sql<number>`sum(cast(${orders.totalAmount} as decimal(12,2)))` 
      }).from(orders).where(gte(orders.placedAt, startOfToday)).then(res => res[0]),
      db.select({ 
        yesterdayCount: count(), 
        yesterdayRev: sql<number>`sum(cast(${orders.totalAmount} as decimal(12,2)))` 
      }).from(orders).where(and(gte(orders.placedAt, startOfYesterday), lt(orders.placedAt, startOfToday))).then(res => res[0]),
      db.select({ pendingCount: count() }).from(orders).where(sql`${orders.status} in ('pending', 'processing')`).then(res => res[0])
    ]);

    const todayRevenue = Number(todayRev || 0);
    const yesterdayRevenue = Number(yesterdayRev || 0);
    const totalRevenue = Number(totalRevenueVal || 0);
    const pendingOrders = Number(pendingCount || 0);
    const activeLeads = Number(activeLeadCount || 0);
    const activeCoupons = Number(activeCouponCount || 0);
    const publishedRecipes = Number(publishedRecipeCount || 0);
    const pendingReviews = Number(pendingReviewCount || 0);

    // ── Monthly Aggregates ──────────────────────────────────────
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    // Use a single explicit aggregate query here. TiDB can execute the
    // expression, but Drizzle's generated grouped aliases are rejected by
    // some TiDB serverless versions.
    const [monthlyStats] = await db.execute(sql`
      SELECT MONTH(${orders.placedAt}) AS month,
             YEAR(${orders.placedAt}) AS year,
             SUM(${orders.totalAmount}) AS revenue,
             COUNT(*) AS orderCount
      FROM ${orders}
      WHERE ${orders.placedAt} >= ${twelveMonthsAgo}
      GROUP BY YEAR(${orders.placedAt}), MONTH(${orders.placedAt})
    `) as unknown as [{ month: number; year: number; revenue: number; orderCount: number }[]];

    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const match = monthlyStats.find(s => s.month === m && s.year === y);
      monthlyData.push({
        month: MONTHS[d.getMonth()],
        revenue: Number(match?.revenue || 0),
        orders: Number(match?.orderCount || 0)
      });
    }

    // ── Category split ───────────────────────────────────────────
    const catStats = await db.select({
      categoryId: products.categoryId,
      count: count()
    }).from(products).groupBy(products.categoryId);

    const categoryData = catStats.map(s => {
      const cat = allCategories.find(c => c.id === s.categoryId);
      return {
        name: cat?.name || 'Uncategorized',
        value: Math.round((Number(s.count) / Number(productCount || 1)) * 100)
      };
    });

    // ── Revenue deltas ─────────────────────────────────────────────
    const revenueDelta = yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 1000) / 10
      : 0;
    const ordersCountDelta = Number(yesterdayCount || 0) > 0
      ? Math.round(((Number(todayCount || 0) - Number(yesterdayCount || 0)) / Number(yesterdayCount || 0)) * 1000) / 10
      : 0;

    sendSuccess(res, {
      totalOrders: Number(orderCount || 0),
      todayOrders: Number(todayCount || 0),
      todayRevenue,
      yesterdayRevenue,
      totalRevenue,
      pendingOrders,
      totalCustomers: Number(customerCount || 0),
      totalProducts: Number(productCount || 0),
      lowStockProducts,
      totalCoupons: Number(couponCount || 0),
      activeCoupons,
      totalRecipes: Number(recipeCount || 0),
      publishedRecipes,
      totalReviews: Number(reviewCount || 0),
      pendingReviews,
      totalWholesaleLeads: Number(leadCount || 0),
      activeWholesaleLeads: activeLeads,
      revenueChangePct: revenueDelta,
      ordersChangePct: ordersCountDelta,
      monthlyData,
      categoryData,
      recentOrders: recentOrders.map(o => ({ ...o, total: Number(o.total) })),
    });
  } catch (error) {
    next(error);
  }
}

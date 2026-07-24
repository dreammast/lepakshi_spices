import { Router } from 'express';
import healthRoute from './health.route.js';
import categoriesRoute from './category.route.js';
import productsRoute from './product.route.js';
import authRoute from './auth.route.js';
import uploadRoute from './upload.route.js';
import genericRoute from './generic.route.js';
import ordersRoute from './order.route.js';
import adminOrdersRoute from './admin-order.route.js';
import cartRoute, { wishlistRouter } from './cart.route.js';
import addressesRoute from './address.route.js';
import collectionRoute from './collection.route.js';
import { couponAdminRouter, couponPublicRouter } from './coupon.route.js';
import { campaignAdminRouter, campaignPublicRouter } from './campaign.route.js';
import { recipeAdminRouter, recipePublicRouter } from './recipe.route.js';
import { productReviewRouter, publicReviewRouter, adminReviewRouter } from './review.route.js';
import { settingsAdminRouter, settingsPublicRouter } from './settings.route.js';
import { wholesaleAdminRouter, wholesalePublicRouter } from './wholesale.route.js';
import packagingRoute from './packaging.route.js';
import adminCustomerRoute from './admin-customer.route.js';
import auditRoute from './audit.route.js';
import { getDashboardStatsController } from '../controllers/dashboard.controller.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();
router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/categories', categoriesRoute);
router.use('/products', productsRoute);
router.use('/products/:id/reviews', productReviewRouter);
router.use('/reviews', publicReviewRouter);
router.use('/orders', ordersRoute);
router.use('/admin/orders', adminOrdersRoute);
router.use('/cart', cartRoute);
router.use('/wishlist', wishlistRouter);
router.use('/addresses', addressesRoute);
router.use('/upload', uploadRoute);

router.use('/collections', collectionRoute);
router.use('/admin/coupons', couponAdminRouter);
router.use('/coupons', couponPublicRouter);
router.use('/admin/campaigns', campaignAdminRouter);
router.use('/campaigns', campaignPublicRouter);
router.use('/admin/recipes', recipeAdminRouter);
router.use('/recipes', recipePublicRouter);
router.use('/admin/reviews', adminReviewRouter);
router.use('/admin/settings', settingsAdminRouter);
router.use('/settings', settingsPublicRouter);
router.use('/admin', wholesaleAdminRouter);
router.use('/wholesale-inquiries', wholesalePublicRouter);
router.use('/', packagingRoute);
router.use('/admin/customers', adminCustomerRoute);
router.use('/admin/audit-logs', auditRoute);
router.get('/admin/dashboard/stats', asyncHandler(getDashboardStatsController));

router.use('/entities', genericRoute);

export default router;


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

const router = Router();
router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/categories', categoriesRoute);
router.use('/products', productsRoute);
router.use('/orders', ordersRoute);
router.use('/admin/orders', adminOrdersRoute);
router.use('/cart', cartRoute);
router.use('/wishlist', wishlistRouter);
router.use('/addresses', addressesRoute);
router.use('/upload', uploadRoute);
router.use('/entities', genericRoute);

export default router;

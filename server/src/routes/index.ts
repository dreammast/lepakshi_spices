import { Router } from 'express';
import healthRoute from './health.route.js';
import categoriesRoute from './category.route.js';
import productsRoute from './product.route.js';
import authRoute from './auth.route.js';
import uploadRoute from './upload.route.js';
import genericRoute from './generic.route.js';

const router = Router();
router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/categories', categoriesRoute);
router.use('/products', productsRoute);
router.use('/upload', uploadRoute);
router.use('/entities', genericRoute);

export default router;


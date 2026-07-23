import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { listCollectionsController, getCollectionController, createCollectionController, updateCollectionController, deleteCollectionController, setCollectionProductsController } from '../controllers/collection.controller.js';

const router = Router();
const adminGuard = [authenticate, requireRole('staff', 'manager', 'admin')] as const;

router.get('/', asyncHandler(listCollectionsController));
router.get('/:slug', asyncHandler(getCollectionController));
router.post('/', ...adminGuard, asyncHandler(createCollectionController));
router.put('/:id', ...adminGuard, asyncHandler(updateCollectionController));
router.delete('/:id', ...adminGuard, asyncHandler(deleteCollectionController));
router.put('/:id/products', ...adminGuard, asyncHandler(setCollectionProductsController));

export default router;

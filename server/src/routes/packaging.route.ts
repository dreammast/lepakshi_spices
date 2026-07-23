import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { listPackagingController, createPackagingController, updatePackagingController, deletePackagingController } from '../controllers/packaging.controller.js';

const router = Router();
const adminGuard = [authenticate, requireRole('staff', 'manager', 'admin')] as const;

// Product packaging routes — GET is public, writes are admin
router.get('/products/:id/packaging', asyncHandler(listPackagingController));
router.post('/products/:id/packaging', ...adminGuard, asyncHandler(createPackagingController));
router.put('/packaging/:id', ...adminGuard, asyncHandler(updatePackagingController));
router.delete('/packaging/:id', ...adminGuard, asyncHandler(deletePackagingController));

export default router;

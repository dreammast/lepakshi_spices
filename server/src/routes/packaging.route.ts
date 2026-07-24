import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listPackagingController, createPackagingController, updatePackagingController, deletePackagingController } from '../controllers/packaging.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/products/:id/packaging', asyncHandler(listPackagingController));
router.post('/products/:id/packaging', authenticate, requireRole('admin', 'manager', 'staff'), asyncHandler(createPackagingController));
router.put('/packaging/:id', authenticate, requireRole('admin', 'manager', 'staff'), asyncHandler(updatePackagingController));
router.delete('/packaging/:id', authenticate, requireRole('admin', 'manager', 'staff'), asyncHandler(deletePackagingController));

export default router;

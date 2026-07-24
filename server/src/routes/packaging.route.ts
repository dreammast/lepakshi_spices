import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listPackagingController, createPackagingController, updatePackagingController, deletePackagingController } from '../controllers/packaging.controller.js';

const router = Router();

router.get('/products/:id/packaging', asyncHandler(listPackagingController));
router.post('/products/:id/packaging', asyncHandler(createPackagingController));
router.put('/packaging/:id', asyncHandler(updatePackagingController));
router.delete('/packaging/:id', asyncHandler(deletePackagingController));

export default router;

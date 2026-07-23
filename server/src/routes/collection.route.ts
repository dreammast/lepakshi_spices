import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listCollectionsController, getCollectionController, createCollectionController, updateCollectionController, deleteCollectionController, setCollectionProductsController } from '../controllers/collection.controller.js';

const router = Router();

router.get('/', asyncHandler(listCollectionsController));
router.get('/:slug', asyncHandler(getCollectionController));
router.post('/', asyncHandler(createCollectionController));
router.put('/:id', asyncHandler(updateCollectionController));
router.delete('/:id', asyncHandler(deleteCollectionController));
router.put('/:id/products', asyncHandler(setCollectionProductsController));

export default router;

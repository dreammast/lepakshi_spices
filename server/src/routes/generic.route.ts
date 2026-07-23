import { Router } from 'express';
import {
  listEntitiesController,
  getEntityController,
  createEntityController,
  updateEntityController,
  deleteEntityController
} from '../controllers/generic.controller.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

router.get('/:entity', asyncHandler(listEntitiesController));
router.post('/:entity', asyncHandler(createEntityController));
router.get('/:entity/:id', asyncHandler(getEntityController));
router.put('/:entity/:id', asyncHandler(updateEntityController));
router.delete('/:entity/:id', asyncHandler(deleteEntityController));

export default router;

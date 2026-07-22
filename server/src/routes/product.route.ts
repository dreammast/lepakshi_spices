import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { getProductController, listProductsController, createProductController, updateProductController, deleteProductController } from '../controllers/product.controller.js';

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: List all active products
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product
 *     responses:
 *       201:
 *         description: Product created
 * /products/{id}:
 *   put:
 *     summary: Update an existing product
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.get('/', asyncHandler(listProductsController));
router.post('/', asyncHandler(createProductController));
router.put('/:id', asyncHandler(updateProductController));
router.delete('/:id', asyncHandler(deleteProductController));
router.get('/:slug', asyncHandler(getProductController));

export default router;




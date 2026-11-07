import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { requireAdmin } from '../middleware/auth';
import { MAX_PRODUCT_IMAGES_PER_REQUEST, productUpload } from '../config/multer';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);

// Admin routes
router.get('/admin/all', requireAdmin, productController.getAllProductsAdmin);
router.get('/admin/:id', requireAdmin, productController.getProductAdmin);
router.post('/', requireAdmin, productUpload.array('images', MAX_PRODUCT_IMAGES_PER_REQUEST), productController.createProduct);
router.put('/:id', requireAdmin, productUpload.array('images', MAX_PRODUCT_IMAGES_PER_REQUEST), productController.updateProduct);
router.delete('/:id', requireAdmin, productController.deleteProduct);
router.delete('/:id/images/:imageId', requireAdmin, productController.deleteProductImage);
router.put('/:id/images/reorder', requireAdmin, productController.reorderProductImages);
router.put('/:id/images/:imageId/primary', requireAdmin, productController.setPrimaryImage);
router.put('/:id/images/:imageId', requireAdmin, productUpload.single('image'), productController.replaceProductImage);

// Public slug route (must be after /admin/all and /featured to avoid conflicts)
router.get('/:slug', productController.getProductBySlug);

export default router;

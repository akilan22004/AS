import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/admin/all', requireAdmin, categoryController.getAdminCategories);
router.post('/', requireAdmin, categoryController.createCategory);
router.put('/:id', requireAdmin, categoryController.updateCategory);
router.delete('/:id', requireAdmin, categoryController.deleteCategory);

export default router;

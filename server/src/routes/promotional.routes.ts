import { Router } from 'express';
import * as promoController from '../controllers/promotional.controller';
import { requireAdmin } from '../middleware/auth';
import { promoUpload } from '../config/multer';

const router = Router();

router.get('/', promoController.getPublishedPromo);
router.get('/admin/all', requireAdmin, promoController.getAllPromo);
router.post('/', requireAdmin, promoUpload.single('file'), promoController.createPromo);
router.put('/:id', requireAdmin, promoController.updatePromo);
router.delete('/:id', requireAdmin, promoController.deletePromo);

export default router;

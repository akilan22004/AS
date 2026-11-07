import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/dashboard', requireAdmin, adminController.getDashboardStats);

export default router;

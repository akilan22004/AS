import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/public', settingsController.getPublicSettings);
router.get('/', requireAdmin, settingsController.getAllSettings);
router.put('/', requireAdmin, settingsController.updateSettings);

export default router;

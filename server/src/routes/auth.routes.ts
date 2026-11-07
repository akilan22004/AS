import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', loginRateLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);

export default router;

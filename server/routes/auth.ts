import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();
const authController = new AuthController();

router.post('/register', authLimiter, (req, res) => authController.register(req, res));
router.post('/login', authLimiter, (req, res) => authController.login(req, res));
router.get('/me', authenticate, (req, res) => authController.getCurrentUser(req, res));

export default router;

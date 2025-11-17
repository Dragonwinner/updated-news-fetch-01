import { Router } from 'express';
import authRoutes from './auth';
import domainRoutes from './domains';

const router = Router();

router.use('/auth', authRoutes);
router.use('/domains', domainRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;

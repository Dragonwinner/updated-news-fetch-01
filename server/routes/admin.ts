import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import * as adminController from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/stats
 * Get comprehensive dashboard statistics
 */
router.get('/stats', adminController.getDashboardStats);

/**
 * GET /api/admin/stats/user-growth
 * Get user growth data for charts
 * Query params: days (default: 30)
 */
router.get('/stats/user-growth', adminController.getUserGrowth);

/**
 * GET /api/admin/stats/domain-generation
 * Get domain generation trends
 * Query params: days (default: 30)
 */
router.get('/stats/domain-generation', adminController.getDomainGeneration);

/**
 * GET /api/admin/stats/activity
 * Get activity metrics by hour
 * Query params: hours (default: 24)
 */
router.get('/stats/activity', adminController.getActivityMetrics);

/**
 * GET /api/admin/users
 * Get all users with pagination
 * Query params: page (default: 1), limit (default: 50)
 */
router.get('/users', adminController.getAllUsers);

/**
 * PATCH /api/admin/users/:userId/status
 * Update user status (activate/deactivate)
 * Body: { isActive: boolean }
 */
router.patch('/users/:userId/status', adminController.updateUserStatus);

/**
 * PATCH /api/admin/users/:userId/role
 * Update user role
 * Body: { role: 'user' | 'admin' }
 */
router.patch('/users/:userId/role', adminController.updateUserRole);

/**
 * POST /api/admin/cache/clear
 * Clear statistics cache
 */
router.post('/cache/clear', adminController.clearCache);

export default router;

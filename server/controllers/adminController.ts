import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { adminService } from '../services/adminService.js';

/**
 * Get comprehensive dashboard statistics
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

/**
 * Get user growth data for charts
 */
export const getUserGrowth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = await adminService.getUserGrowthData(days);
    res.json(data);
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    res.status(500).json({ error: 'Failed to fetch user growth data' });
  }
};

/**
 * Get domain generation trends
 */
export const getDomainGeneration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = await adminService.getDomainGenerationData(days);
    res.json(data);
  } catch (error) {
    console.error('Error fetching domain generation data:', error);
    res.status(500).json({ error: 'Failed to fetch domain generation data' });
  }
};

/**
 * Get activity metrics by hour
 */
export const getActivityMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const data = await adminService.getActivityMetrics(hours);
    res.json(data);
  } catch (error) {
    console.error('Error fetching activity metrics:', error);
    res.status(500).json({ error: 'Failed to fetch activity metrics' });
  }
};

/**
 * Get all users with pagination
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await adminService.getAllUsers(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ error: 'isActive must be a boolean' });
      return;
    }

    const user = await adminService.updateUserStatus(userId, isActive);
    res.json({ 
      message: 'User status updated successfully', 
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    const message = error instanceof Error ? error.message : 'Failed to update user status';
    res.status(404).json({ error: message });
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (role !== 'user' && role !== 'admin') {
      res.status(400).json({ error: 'Role must be either "user" or "admin"' });
      return;
    }

    const user = await adminService.updateUserRole(userId, role);
    res.json({ 
      message: 'User role updated successfully', 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    const message = error instanceof Error ? error.message : 'Failed to update user role';
    res.status(404).json({ error: message });
  }
};

/**
 * Clear statistics cache
 */
export const clearCache = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await adminService.clearStatsCache();
    res.json({ message: 'Statistics cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
};

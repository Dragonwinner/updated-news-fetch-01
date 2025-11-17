import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { Domain } from '../models/Domain';
import { NewsArticle } from '../models/NewsArticle';
import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { getRedisClient } from '../config/redis';

const CACHE_TTL = 300; // 5 minutes cache

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    admins: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  domains: {
    total: number;
    available: number;
    unavailable: number;
    generatedToday: number;
    generatedThisWeek: number;
    generatedThisMonth: number;
    avgScore: number;
  };
  articles: {
    total: number;
    todayCount: number;
    thisWeekCount: number;
    thisMonthCount: number;
    sources: Array<{ source: string; count: number }>;
  };
  analytics: {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    topEvents: Array<{ eventType: string; count: number }>;
  };
  system: {
    databaseSize: string;
    redisConnected: boolean;
    uptime: number;
  };
}

export interface UserGrowthData {
  date: string;
  total: number;
  new: number;
}

export interface DomainGenerationData {
  date: string;
  count: number;
  available: number;
}

export interface ActivityMetrics {
  hour: string;
  events: number;
  users: number;
}

class AdminService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const cacheKey = 'admin:dashboard:stats';
    
    // Try to get from cache
    try {
      const redisClient = getRedisClient();
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      // Redis not available, continue without cache
    }

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - 7));
    const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));

    // User statistics
    const [totalUsers, activeUsers, adminUsers, newToday, newThisWeek, newThisMonth] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({ where: { role: 'admin' } }),
      User.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
      User.count({ where: { createdAt: { [Op.gte]: startOfWeek } } }),
      User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
    ]);

    // Domain statistics
    const [
      totalDomains,
      availableDomains,
      domainsToday,
      domainsWeek,
      domainsMonth,
      avgScoreResult,
    ] = await Promise.all([
      Domain.count(),
      Domain.count({ where: { available: true } }),
      Domain.count({ where: { generatedAt: { [Op.gte]: startOfToday } } }),
      Domain.count({ where: { generatedAt: { [Op.gte]: startOfWeek } } }),
      Domain.count({ where: { generatedAt: { [Op.gte]: startOfMonth } } }),
      Domain.findOne({
        attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']],
        raw: true,
      }),
    ]);

    const avgScore = Math.round(Number((avgScoreResult as unknown as { avgScore: string | null })?.avgScore) || 0);

    // Article statistics
    const [totalArticles, articlesToday, articlesWeek, articlesMonth, sourceCounts] = await Promise.all([
      NewsArticle.count(),
      NewsArticle.count({ where: { publishedAt: { [Op.gte]: startOfToday } } }),
      NewsArticle.count({ where: { publishedAt: { [Op.gte]: startOfWeek } } }),
      NewsArticle.count({ where: { publishedAt: { [Op.gte]: startOfMonth } } }),
      NewsArticle.findAll({
        attributes: [
          'source',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['source'],
        raw: true,
        limit: 10,
      }),
    ]);

    // Analytics statistics
    const [totalEvents, uniqueUsers, uniqueSessions, topEvents] = await Promise.all([
      AnalyticsEvent.count(),
      AnalyticsEvent.count({
        distinct: true,
        col: 'userId',
        where: { userId: { [Op.ne]: null } },
      }),
      AnalyticsEvent.count({
        distinct: true,
        col: 'sessionId',
        where: { sessionId: { [Op.ne]: null } },
      }),
      AnalyticsEvent.findAll({
        attributes: [
          'eventType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['eventType'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10,
        raw: true,
      }),
    ]);

    // System statistics
    const dbSizeResult = await sequelize.query(
      `SELECT pg_size_pretty(pg_database_size(current_database())) as size;`,
      { type: QueryTypes.SELECT }
    );
    const databaseSize = (dbSizeResult[0] as { size: string })?.size || 'Unknown';

    let redisConnected = false;
    try {
      const redisClient = getRedisClient();
      redisConnected = redisClient.status === 'ready';
    } catch {
      redisConnected = false;
    }

    const stats: DashboardStats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        newToday,
        newThisWeek,
        newThisMonth,
      },
      domains: {
        total: totalDomains,
        available: availableDomains,
        unavailable: totalDomains - availableDomains,
        generatedToday: domainsToday,
        generatedThisWeek: domainsWeek,
        generatedThisMonth: domainsMonth,
        avgScore,
      },
      articles: {
        total: totalArticles,
        todayCount: articlesToday,
        thisWeekCount: articlesWeek,
        thisMonthCount: articlesMonth,
        sources: sourceCounts.map((s) => ({
          source: (s as unknown as { source: string; count: number }).source,
          count: Number((s as unknown as { source: string; count: number }).count),
        })),
      },
      analytics: {
        totalEvents,
        uniqueUsers,
        uniqueSessions,
        topEvents: topEvents.map((e) => ({
          eventType: (e as unknown as { eventType: string; count: number }).eventType,
          count: Number((e as unknown as { eventType: string; count: number }).count),
        })),
      },
      system: {
        databaseSize,
        redisConnected,
        uptime: process.uptime(),
      },
    };

    // Cache the results
    try {
      const redisClient = getRedisClient();
      await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(stats));
    } catch {
      // Redis not available, continue without caching
    }

    return stats;
  }

  /**
   * Get user growth data for charts
   */
  async getUserGrowthData(days: number = 30): Promise<UserGrowthData[]> {
    const cacheKey = `admin:user-growth:${days}`;
    
    try {
      const redisClient = getRedisClient();
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Redis not available, continue without cache
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await sequelize.query(
      `
      WITH RECURSIVE dates AS (
        SELECT DATE(:startDate) as date
        UNION ALL
        SELECT (date + INTERVAL '1 day')::date
        FROM dates
        WHERE date < :endDate
      ),
      user_counts AS (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_users
        FROM users
        WHERE created_at >= :startDate AND created_at <= :endDate
        GROUP BY DATE(created_at)
      ),
      cumulative AS (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total
        FROM users
        WHERE created_at <= :endDate
        GROUP BY DATE(created_at)
      )
      SELECT 
        dates.date::text,
        COALESCE(
          (SELECT total FROM cumulative WHERE cumulative.date <= dates.date ORDER BY date DESC LIMIT 1),
          0
        ) as total,
        COALESCE(user_counts.new_users, 0) as new
      FROM dates
      LEFT JOIN user_counts ON dates.date = user_counts.date
      ORDER BY dates.date
      `,
      {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT,
      }
    );

    const data = result.map((row) => ({
      date: (row as unknown as { date: string }).date,
      total: Number((row as unknown as { total: number }).total),
      new: Number((row as unknown as { new: number }).new),
    }));

    try {
      const redisClient = getRedisClient();
      await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
    } catch {
      // Redis not available, continue without caching
    }

    return data;
  }

  /**
   * Get domain generation trends
   */
  async getDomainGenerationData(days: number = 30): Promise<DomainGenerationData[]> {
    const cacheKey = `admin:domain-generation:${days}`;
    
    try {
      const redisClient = getRedisClient();
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Redis not available, continue without cache
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await sequelize.query(
      `
      WITH RECURSIVE dates AS (
        SELECT DATE(:startDate) as date
        UNION ALL
        SELECT (date + INTERVAL '1 day')::date
        FROM dates
        WHERE date < :endDate
      )
      SELECT 
        dates.date::text,
        COALESCE(COUNT(d.id), 0) as count,
        COALESCE(SUM(CASE WHEN d.available = true THEN 1 ELSE 0 END), 0) as available
      FROM dates
      LEFT JOIN domains d ON DATE(d.generated_at) = dates.date
      GROUP BY dates.date
      ORDER BY dates.date
      `,
      {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT,
      }
    );

    const data = result.map((row) => ({
      date: (row as unknown as { date: string }).date,
      count: Number((row as unknown as { count: number }).count),
      available: Number((row as unknown as { available: number }).available),
    }));

    try {
      const redisClient = getRedisClient();
      await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
    } catch {
      // Redis not available, continue without caching
    }

    return data;
  }

  /**
   * Get activity metrics by hour
   */
  async getActivityMetrics(hours: number = 24): Promise<ActivityMetrics[]> {
    const cacheKey = `admin:activity-metrics:${hours}`;
    
    try {
      const redisClient = getRedisClient();
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Redis not available, continue without cache
    }

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    const result = await sequelize.query(
      `
      SELECT 
        TO_CHAR(DATE_TRUNC('hour', created_at), 'YYYY-MM-DD HH24:00') as hour,
        COUNT(*) as events,
        COUNT(DISTINCT user_id) as users
      FROM analytics_events
      WHERE created_at >= :startDate
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY hour
      `,
      {
        replacements: { startDate },
        type: QueryTypes.SELECT,
      }
    );

    const data = result.map((row) => ({
      hour: (row as unknown as { hour: string }).hour,
      events: Number((row as unknown as { events: number }).events),
      users: Number((row as unknown as { users: number }).users),
    }));

    try {
      const redisClient = getRedisClient();
      await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
    } catch {
      // Redis not available, continue without caching
    }

    return data;
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      users: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = isActive;
    await user.save();

    return user;
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: 'user' | 'admin') {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.role = role;
    await user.save();

    return user;
  }

  /**
   * Clear statistics cache
   */
  async clearStatsCache() {
    const pattern = 'admin:*';
    try {
      const redisClient = getRedisClient();
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {
      // Redis not available, skip cache clearing
    }
  }
}

export const adminService = new AdminService();

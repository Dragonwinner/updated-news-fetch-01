import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { getRedisClient } from '../config/redis';
import { config } from '../config';
import { Op } from 'sequelize';

export class AnalyticsService {
  private redis;

  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Track an event
   */
  async trackEvent(
    eventType: string,
    eventData: Record<string, unknown>,
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    if (!config.analytics.enabled) {
      return;
    }

    try {
      // Store in database
      await AnalyticsEvent.create({
        userId,
        eventType,
        eventData,
        sessionId,
        ipAddress,
        userAgent,
      });

      // Update real-time counters in Redis
      const today = new Date().toISOString().split('T')[0];
      await this.redis.hincrby(`analytics:events:${today}`, eventType, 1);
      
      if (userId) {
        await this.redis.hincrby(`analytics:users:${today}`, userId, 1);
      }
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  /**
   * Get event counts for a specific date
   */
  async getEventCounts(date?: string): Promise<Record<string, string>> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.redis.hgetall(`analytics:events:${targetDate}`);
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, days: number = 7) {
    const events = await AnalyticsEvent.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: days * 100, // Approximate
    });

    return events;
  }

  /**
   * Get popular domains
   */
  async getPopularDomains(limit: number = 10) {
    // Get domain view events
    const events = await AnalyticsEvent.findAll({
      where: { eventType: 'domain_view' },
      order: [['createdAt', 'DESC']],
      limit: 1000,
    });

    // Count domain views
    const domainCounts: Record<string, number> = {};
    events.forEach(event => {
      const domainId = event.eventData.domainId as string;
      if (domainId) {
        domainCounts[domainId] = (domainCounts[domainId] || 0) + 1;
      }
    });

    // Sort and return top domains
    return Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([domainId, count]) => ({ domainId, views: count }));
  }

  /**
   * Get analytics summary
   */
  async getSummary(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await AnalyticsEvent.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
        },
      },
    });

    // Calculate metrics
    const totalEvents = events.length;
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(events.map(e => e.sessionId).filter(Boolean)).size;

    // Event type breakdown
    const eventTypes: Record<string, number> = {};
    events.forEach(event => {
      eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
    });

    return {
      totalEvents,
      uniqueUsers,
      uniqueSessions,
      eventTypes,
      period: { days, startDate, endDate: new Date() },
    };
  }
}

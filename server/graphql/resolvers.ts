import { AuthService } from '../services/authService';
import { DomainService } from '../services/domainService';
import { NewsService } from '../services/newsService';
import { AnalyticsService } from '../services/analyticsService';
import { ABTestingService } from '../services/abTestingService';
import { UserAlert } from '../models/UserAlert';

const authService = new AuthService();
const domainService = new DomainService();
const newsService = new NewsService();
const analyticsService = new AnalyticsService();
const abTestingService = new ABTestingService();

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: { user?: { userId: string } }) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return authService.getUserById(context.user.userId);
    },

    domains: async (_: unknown, args: {
      tld?: string;
      available?: boolean;
      minScore?: number;
      limit?: number;
      offset?: number;
    }) => {
      return domainService.getDomains(args);
    },

    domain: async (_: unknown, args: { id: string }) => {
      return domainService.getDomainById(args.id);
    },

    newsArticles: async (_: unknown, args: { limit?: number }) => {
      return newsService.getRecentArticles(args.limit || 50);
    },

    newsArticle: async (_: unknown, args: { id: string }) => {
      return newsService.getArticleById(args.id);
    },

    myAlerts: async (_: unknown, __: unknown, context: { user?: { userId: string } }) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return UserAlert.findAll({
        where: { userId: context.user.userId },
      });
    },

    analyticsSummary: async (_: unknown, args: { days?: number }) => {
      const summary = await analyticsService.getSummary(args.days || 7);
      return {
        ...summary,
        eventTypes: JSON.stringify(summary.eventTypes),
      };
    },

    activeABTests: async () => {
      const tests = await abTestingService.getActiveTests();
      return tests.map(test => ({
        ...test.toJSON(),
        variants: JSON.stringify(test.variants),
        metrics: JSON.stringify(test.metrics),
      }));
    },
  },

  Mutation: {
    register: async (_: unknown, args: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      return authService.register(args);
    },

    login: async (_: unknown, args: { email: string; password: string }) => {
      return authService.login(args);
    },

    createAlert: async (_: unknown, args: {
      domainId?: string;
      alertType: string;
      conditions: string;
      notificationEmail?: boolean;
      notificationPush?: boolean;
    }, context: { user?: { userId: string } }) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return UserAlert.create({
        userId: context.user.userId,
        domainId: args.domainId,
        alertType: args.alertType as 'availability' | 'price_drop' | 'price_increase' | 'new_domain',
        conditions: JSON.parse(args.conditions),
        isActive: true,
        notificationEmail: args.notificationEmail ?? true,
        notificationPush: args.notificationPush ?? false,
      });
    },

    deleteAlert: async (_: unknown, args: { id: string }, context: { user?: { userId: string } }) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const alert = await UserAlert.findOne({
        where: {
          id: args.id,
          userId: context.user.userId,
        },
      });

      if (!alert) {
        throw new Error('Alert not found');
      }

      await alert.destroy();
      return true;
    },

    trackEvent: async (_: unknown, args: {
      eventType: string;
      eventData: string;
    }, context: { user?: { userId: string } }) => {
      await analyticsService.trackEvent(
        args.eventType,
        JSON.parse(args.eventData),
        context.user?.userId
      );
      return true;
    },
  },
};

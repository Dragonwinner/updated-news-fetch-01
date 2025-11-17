import { User } from './User.js';
import { Domain } from './Domain.js';
import { NewsArticle } from './NewsArticle.js';
import { UserAlert } from './UserAlert.js';
import { AnalyticsEvent } from './AnalyticsEvent.js';
import { ABTest } from './ABTest.js';

// Define associations
User.hasMany(UserAlert, { foreignKey: 'userId', as: 'alerts' });
UserAlert.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Domain.hasMany(UserAlert, { foreignKey: 'domainId', as: 'alerts' });
UserAlert.belongsTo(Domain, { foreignKey: 'domainId', as: 'domain' });

User.hasMany(AnalyticsEvent, { foreignKey: 'userId', as: 'events' });
AnalyticsEvent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Domain,
  NewsArticle,
  UserAlert,
  AnalyticsEvent,
  ABTest,
};

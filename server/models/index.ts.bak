import { User } from './User';
import { Domain } from './Domain';
import { NewsArticle } from './NewsArticle';
import { UserAlert } from './UserAlert';
import { AnalyticsEvent } from './AnalyticsEvent';
import { ABTest } from './ABTest';

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

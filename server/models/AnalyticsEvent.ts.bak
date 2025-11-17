import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AnalyticsEventAttributes {
  id: string;
  userId?: string;
  eventType: string;
  eventData: Record<string, unknown>;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

interface AnalyticsEventCreationAttributes extends Optional<AnalyticsEventAttributes, 'id' | 'userId' | 'sessionId' | 'ipAddress' | 'userAgent'> {
  // Empty interface to satisfy type requirements
}

export class AnalyticsEvent extends Model<AnalyticsEventAttributes, AnalyticsEventCreationAttributes> implements AnalyticsEventAttributes {
  public id!: string;
  public userId?: string;
  public eventType!: string;
  public eventData!: Record<string, unknown>;
  public sessionId?: string;
  public ipAddress?: string;
  public userAgent?: string;
  
  public readonly createdAt!: Date;
}

AnalyticsEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventData: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'analytics_events',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['eventType'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['sessionId'],
      },
    ],
  }
);

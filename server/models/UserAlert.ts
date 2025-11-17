import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAlertAttributes {
  id: string;
  userId: string;
  domainId?: string;
  alertType: 'availability' | 'price_drop' | 'price_increase' | 'new_domain';
  conditions: Record<string, unknown>;
  isActive: boolean;
  notificationEmail: boolean;
  notificationPush: boolean;
  lastTriggered?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserAlertCreationAttributes extends Optional<UserAlertAttributes, 'id' | 'domainId' | 'lastTriggered'> {
  // Empty interface to satisfy type requirements
}

export class UserAlert extends Model<UserAlertAttributes, UserAlertCreationAttributes> implements UserAlertAttributes {
  public id!: string;
  public userId!: string;
  public domainId?: string;
  public alertType!: 'availability' | 'price_drop' | 'price_increase' | 'new_domain';
  public conditions!: Record<string, unknown>;
  public isActive!: boolean;
  public notificationEmail!: boolean;
  public notificationPush!: boolean;
  public lastTriggered?: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserAlert.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    domainId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'domains',
        key: 'id',
      },
    },
    alertType: {
      type: DataTypes.ENUM('availability', 'price_drop', 'price_increase', 'new_domain'),
      allowNull: false,
    },
    conditions: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notificationEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notificationPush: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastTriggered: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_alerts',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['domainId'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

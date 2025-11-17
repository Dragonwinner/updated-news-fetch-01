import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface ABTestAttributes {
  id: string;
  name: string;
  description: string;
  variants: Array<{ id: string; name: string; weight: number; }>;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  metrics: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ABTestCreationAttributes extends Optional<ABTestAttributes, 'id' | 'endDate' | 'metrics'> {
  // Empty interface to satisfy type requirements
}

export class ABTest extends Model<ABTestAttributes, ABTestCreationAttributes> implements ABTestAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public variants!: Array<{ id: string; name: string; weight: number; }>;
  public isActive!: boolean;
  public startDate!: Date;
  public endDate?: Date;
  public metrics!: Record<string, unknown>;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ABTest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    variants: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metrics: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'ab_tests',
    timestamps: true,
    indexes: [
      {
        fields: ['isActive'],
      },
      {
        fields: ['startDate'],
      },
    ],
  }
);

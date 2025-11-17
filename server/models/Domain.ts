import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DomainAttributes {
  id: string;
  name: string;
  tld: string;
  available: boolean;
  price?: number;
  currency: string;
  keywords: string[];
  score: number;
  generatedAt: Date;
  checkedAt?: Date;
  sourceArticleId?: string;
  popularity: number;
  priceHistory?: Array<{ price: number; date: Date; }>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DomainCreationAttributes extends Optional<DomainAttributes, 'id' | 'price' | 'checkedAt' | 'sourceArticleId' | 'popularity' | 'priceHistory'> {}

export class Domain extends Model<DomainAttributes, DomainCreationAttributes> implements DomainAttributes {
  public id!: string;
  public name!: string;
  public tld!: string;
  public available!: boolean;
  public price?: number;
  public currency!: string;
  public keywords!: string[];
  public score!: number;
  public generatedAt!: Date;
  public checkedAt?: Date;
  public sourceArticleId?: string;
  public popularity!: number;
  public priceHistory?: Array<{ price: number; date: Date; }>;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Domain.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tld: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    generatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    checkedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sourceArticleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    popularity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    priceHistory: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'domains',
    timestamps: true,
    indexes: [
      {
        fields: ['name', 'tld'],
      },
      {
        fields: ['available'],
      },
      {
        fields: ['generatedAt'],
      },
      {
        fields: ['score'],
      },
    ],
  }
);

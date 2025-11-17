import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface NewsArticleAttributes {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
  extractedKeywords: string[];
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsArticleCreationAttributes extends Optional<NewsArticleAttributes, 'id' | 'extractedKeywords' | 'processedAt'> {
  // Empty interface to satisfy type requirements
}

export class NewsArticle extends Model<NewsArticleAttributes, NewsArticleCreationAttributes> implements NewsArticleAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public content!: string;
  public url!: string;
  public source!: string;
  public publishedAt!: Date;
  public extractedKeywords!: string[];
  public processedAt?: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsArticle.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      unique: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    extractedKeywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'news_articles',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['url'],
      },
      {
        fields: ['publishedAt'],
      },
      {
        fields: ['source'],
      },
    ],
  }
);

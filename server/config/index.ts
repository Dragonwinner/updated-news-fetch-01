import dotenv from 'dotenv';

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  frontendUrl: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
    expire: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  domain: {
    tlds: string[];
    hourlyGeneration: boolean;
    apiKey?: string;
  };
  cron: {
    enabled: boolean;
    schedule: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  analytics: {
    enabled: boolean;
  };
  abTesting: {
    enabled: boolean;
  };
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'news_domain_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '24h',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@newsdomain.com',
  },
  domain: {
    tlds: (process.env.CONFIGURABLE_TLDS || '.com,.co,.io,.ai,.net').split(','),
    hourlyGeneration: process.env.HOURLY_DOMAIN_GENERATION === 'true',
    apiKey: process.env.DOMAIN_CHECK_API_KEY || undefined,
  },
  cron: {
    enabled: process.env.CRON_ENABLED === 'true',
    schedule: process.env.DOMAIN_GENERATION_SCHEDULE || '0 * * * *',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
  },
  abTesting: {
    enabled: process.env.AB_TESTING_ENABLED === 'true',
  },
};

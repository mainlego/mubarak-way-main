import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mubarak-way-unified',

  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  webappUrl: process.env.WEBAPP_URL || 'http://localhost:3000',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // AI Services
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

  // Elasticsearch
  elasticsearchUrl: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  elasticsearchApiUrl: process.env.ELASTICSEARCH_API_URL || 'https://bot.e-replika.ru',
  elasticsearchApiToken: process.env.ELASTICSEARCH_API_TOKEN || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Cache
  cacheTtl: parseInt(process.env.CACHE_TTL || '3600', 10),

  // Rate Limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  rateLimitAiMaxRequests: parseInt(process.env.RATE_LIMIT_AI_MAX_REQUESTS || '10', 10),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

// Validate required environment variables
export const validateEnv = (): void => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'TELEGRAM_BOT_TOKEN',
    'JWT_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0 && config.nodeEnv === 'production') {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach((varName) => console.error(`  - ${varName}`));
    process.exit(1);
  }

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables (using defaults):');
    missingVars.forEach((varName) => console.warn(`  - ${varName}`));
  }
};

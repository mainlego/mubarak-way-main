import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config, validateEnv } from './config/env.js';
import { connectDatabase } from './config/database.js';

// Validate environment variables
validateEnv();

const app = express();

// Trust proxy - required for rate limiting and getting real IP behind reverse proxy (Render, nginx, etc.)
// This allows express-rate-limit to work correctly with X-Forwarded-For header
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
} else {
  app.set('trust proxy', true); // Trust all proxies in development
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, configure properly in production
}));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Telegram, etc.)
    if (!origin) return callback(null, true);

    if (config.allowedOrigins.includes(origin) || origin.includes('telegram')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (for admin panel)
app.use('/admin', express.static('public'));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API status endpoint
app.get('/api/v1/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      name: 'MubarakWay Unified API',
      modules: ['quran', 'library', 'prayer', 'ai', 'subscription'],
    },
  });
});

// Import routes
import authRoutes from './routes/auth.js';
import quranRoutes from './routes/quran.js';
import libraryRoutes from './routes/library.js';
import prayerRoutes from './routes/prayer.js';
import aiRoutes from './routes/ai.js';
import webhookRoutes from './routes/webhook.js';
import bookmarkRoutes from './routes/bookmark.js';
import searchHistoryRoutes from './routes/searchHistory.js';
import adminRoutes from './routes/admin.js';
import adminAuthRoutes from './routes/adminAuth.js';
import lessonRoutes from './routes/lesson.js';
import debugRoutes from './routes/debug.js';
import elasticsearchRoutes from './routes/elasticsearch.js';
import versionRoutes from './routes/version.js';
import playlistRoutes from './routes/playlists.js';
import userRoutes from './routes/user.js';
// import subscriptionRoutes from './routes/subscription.js';

// Use routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/quran', quranRoutes);
app.use('/api/v1/library', libraryRoutes);
app.use('/api/v1/prayer', prayerRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);
app.use('/api/v1/search-history', searchHistoryRoutes);
app.use('/api/v1/playlists', playlistRoutes); // Playlist management
app.use('/api/v1/user', userRoutes); // User favorites/offline management
app.use('/api/v1/admin', adminRoutes);
app.use('/api/admin', adminAuthRoutes); // JWT-based admin authentication
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/debug', debugRoutes);
app.use('/api/elasticsearch', elasticsearchRoutes); // Elasticsearch proxy
app.use('/api/v1/version', versionRoutes); // Version checker
app.use('/webhook', webhookRoutes);
// app.use('/api/v1/subscription', subscriptionRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
});

// Import bot
import { startBot } from './bot/index.js';

// Start server
const startServer = async () => {
  try {
    // Connect to database (skip if using mock data)
    if (process.env.USE_MOCK_DATA !== 'true') {
      await connectDatabase();
    } else {
      console.log('⚠️  Using mock data - MongoDB connection skipped');
    }

    // Start Express server first
    app.listen(config.port, () => {
      console.log(`
🚀 Server is running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Environment: ${config.nodeEnv}
🔗 Port: ${config.port}
🌐 Health check: http://localhost:${config.port}/health
📋 API status: http://localhost:${config.port}/api/v1/status
${process.env.USE_MOCK_DATA === 'true' ? '⚠️  Mode: MOCK DATA (no database)' : '✅ Mode: DATABASE CONNECTED'}
🤖 Telegram Bot: ${config.telegramBotToken ? 'ENABLED' : 'DISABLED'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);

      // Initialize Telegram bot AFTER Express server starts (non-blocking)
      if (config.telegramBotToken) {
        startBot(app).catch(error => {
          console.error('⚠️  Failed to start Telegram bot:', error);
          console.log('⚠️  Continuing without Telegram bot...');
        });
      } else {
        console.log('⚠️  TELEGRAM_BOT_TOKEN not set - bot disabled');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI endpoints rate limiter (stricter)
 */
export const aiLimiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitAiMaxRequests,
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT',
      message: 'AI request limit exceeded. Please upgrade your subscription.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth endpoints rate limiter
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Too many authentication attempts',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

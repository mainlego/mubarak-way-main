/**
 * Rate Limiting Middleware
 */
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

export const authLimiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: 20,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts' },
  },
});

export const aiLimiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitAiMaxRequests,
  message: {
    success: false,
    error: { code: 'AI_RATE_LIMIT', message: 'AI limit exceeded' },
  },
});

export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests' },
  },
});

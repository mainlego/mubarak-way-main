/**
 * Webhook routes for Telegram Bot
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import bot from '../bot/index.js';

const router = Router();

/**
 * Telegram webhook endpoint
 * Receives updates from Telegram servers
 */
router.post('/telegram', async (req: Request, res: Response) => {
  try {
    // Process the update with telegraf
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Health check for webhook
 */
router.get('/telegram', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Telegram webhook endpoint is active',
  });
});

export default router;

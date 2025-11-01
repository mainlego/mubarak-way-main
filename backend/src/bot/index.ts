/**
 * Telegram Bot Entry Point
 *
 * This module exports:
 * - bot: Telegraf bot instance
 * - startBot(): Start bot with webhook/polling
 * - stopBot(): Stop bot gracefully
 * - checkPrayerNotifications(): Check and send prayer notifications
 */

import type { Express } from 'express';
import bot, { checkPrayerNotifications } from './bot.js';
import { loadNotifiedPrayers, clearNotifications } from './notifications.js';
import { config } from '../config/env.js';

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://mubarak-way-frontend.onrender.com';

/**
 * Start bot with webhook or polling
 */
export async function startBot(expressApp?: Express): Promise<typeof bot> {
  try {
    const isProduction = config.nodeEnv === 'production' || process.env.RENDER;

    if (isProduction && expressApp) {
      // ============================================================================
      // PRODUCTION MODE: Webhook
      // ============================================================================
      console.log('🔧 Режим: Webhook (Production)');

      // Delete old webhook
      await bot.telegram.deleteWebhook({ drop_pending_updates: true });
      console.log('🧹 Старый webhook удалён');

      // Set new webhook
      const webhookPath = '/webhook/telegram';
      const backendUrl = WEB_APP_URL.includes('mubarakway-frontend')
        ? 'https://mubarakway-backend.onrender.com'
        : process.env.BACKEND_URL || 'https://mubarakway-backend.onrender.com';
      const webhookUrl = `${backendUrl}${webhookPath}`;

      // Create webhook handler
      const webhookHandler = bot.webhookCallback(webhookPath);

      // Register webhook with logging
      expressApp.post(webhookPath, async (req, res, next) => {
        console.log('🔔 Webhook received');
        console.log(
          '📝 Update type:',
          req.body.message ? 'message' : req.body.callback_query ? 'callback_query' : 'other'
        );
        try {
          await webhookHandler(req, res, next);
          console.log('✅ Webhook handled');
        } catch (error) {
          console.error('❌ Webhook error:', error);
          next(error);
        }
      });

      await bot.telegram.setWebhook(webhookUrl, {
        drop_pending_updates: true,
        allowed_updates: ['message', 'callback_query'],
      });

      console.log('✅ Webhook установлен:', webhookUrl);
      console.log('🤖 MubarakWay Bot запущен успешно (Webhook режим)!');
      console.log('🕌 Готов служить умме...');
      console.log('📱 Web App URL:', WEB_APP_URL);
    } else {
      // ============================================================================
      // DEVELOPMENT MODE: Polling
      // ============================================================================
      console.log('🔧 Режим: Polling (Development)');

      await bot.telegram.deleteWebhook({ drop_pending_updates: true });
      console.log('🧹 Webhook удалён');

      await bot.launch({
        dropPendingUpdates: true,
        allowedUpdates: ['message', 'callback_query'],
      });

      console.log('🤖 MubarakWay Bot запущен успешно (Polling режим)!');
      console.log('🕌 Готов служить умме...');
    }

    // ============================================================================
    // SETUP PRAYER NOTIFICATIONS SYSTEM
    // ============================================================================
    console.log('⏰ Запуск системы уведомлений о времени молитв...');

    // Load previous notifications
    loadNotifiedPrayers();

    // Check every minute
    setInterval(checkPrayerNotifications, 60000);

    // First check immediately
    console.log('🔄 Выполняю первую проверку времени молитв...');
    await checkPrayerNotifications();

    // Set bot commands menu
    await bot.telegram.setMyCommands([
      { command: 'start', description: '🏠 Главное меню' },
      { command: 'prayer', description: '🕌 Время намаза' },
      { command: 'qibla', description: '🧭 Направление киблы' },
      { command: 'library', description: '📚 Библиотека' },
      { command: 'nashids', description: '🎵 Нашиды' },
      { command: 'location', description: '📍 Установить локацию' },
      { command: 'help', description: '🆘 Помощь' },
    ]);
    console.log('✅ Команды бота установлены');

    // Clear old notifications at midnight
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        clearNotifications();
      }
    }, 60000);

    console.log('✅ Система уведомлений о молитвах запущена');

    // Graceful shutdown handlers
    process.once('SIGINT', () => gracefulShutdown('SIGINT'));
    process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

    return bot;
  } catch (error) {
    console.error('💥 Критическая ошибка запуска бота:', error);
    throw error;
  }
}

/**
 * Stop bot gracefully
 */
export async function stopBot(): Promise<void> {
  try {
    await bot.stop();
    console.log('🛑 Telegram bot stopped');
  } catch (error) {
    console.error('❌ Error stopping bot:', error);
  }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n🛑 Получен сигнал ${signal}. Graceful shutdown...`);

  try {
    await bot.stop(signal);
    console.log('✅ Бот остановлен');
  } catch (error) {
    console.error('❌ Ошибка при остановке бота:', error);
  }

  setTimeout(() => {
    console.log('👋 Процесс завершён');
    process.exit(0);
  }, 1000);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export bot instance and functions
export { bot, checkPrayerNotifications };
export default bot;

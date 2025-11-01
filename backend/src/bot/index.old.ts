/**
 * Telegram Bot for MubarakWay
 * Handles bot commands and Web App integration
 */

import { Telegraf, Markup } from 'telegraf';
import type { Context } from 'telegraf';
import { config } from '../config/env.js';

// Bot token from environment
const BOT_TOKEN = config.telegramBotToken;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://mubarak-way-frontend.onrender.com';

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

// Create bot instance
const bot = new Telegraf(BOT_TOKEN);

/**
 * Start command - Welcome message with Web App button
 */
bot.command('start', async (ctx: Context) => {
  const user = ctx.from;

  const welcomeMessage = `
🌙 *Ассаламу алейкум, ${user?.first_name || 'дорогой брат/сестра'}!*

Добро пожаловать в *MubarakWay* — вашу исламскую цифровую платформу!

📖 *Что вы найдете здесь:*
• Священный Коран с переводами
• Исламская библиотека книг
• Нашиды и духовная музыка
• Уроки намаза
• Времена молитв
• AI-ассистент для вопросов

Нажмите кнопку ниже, чтобы открыть приложение! 👇
  `;

  await ctx.replyWithMarkdownV2(
    welcomeMessage.replace(/[-.!()]/g, '\\$&'),
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Открыть MubarakWay', WEB_APP_URL)],
      [Markup.button.callback('ℹ️ О приложении', 'about')],
    ])
  );
});

/**
 * Help command
 */
bot.command('help', async (ctx: Context) => {
  const helpMessage = `
🤝 *Помощь по MubarakWay*

*Доступные команды:*
/start - Начать работу с ботом
/help - Показать это сообщение
/quran - Открыть Коран
/library - Открыть библиотеку
/prayer - Времена намаза
/about - О приложении

*Как пользоваться:*
1. Нажмите кнопку "Открыть MubarakWay"
2. Приложение откроется внутри Telegram
3. Все функции доступны в Web App

Если у вас есть вопросы, свяжитесь с поддержкой: @support
  `;

  await ctx.replyWithMarkdownV2(
    helpMessage.replace(/[-.!()]/g, '\\$&'),
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Открыть приложение', WEB_APP_URL)],
    ])
  );
});

/**
 * Quran command - Direct link to Quran section
 */
bot.command('quran', async (ctx: Context) => {
  await ctx.reply(
    '📖 Открыть Священный Коран',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📖 Читать Коран', `${WEB_APP_URL}/quran`)],
    ])
  );
});

/**
 * Library command - Direct link to Library section
 */
bot.command('library', async (ctx: Context) => {
  await ctx.reply(
    '📚 Открыть исламскую библиотеку',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📚 Библиотека', `${WEB_APP_URL}/library`)],
    ])
  );
});

/**
 * Prayer command - Direct link to Prayer section
 */
bot.command('prayer', async (ctx: Context) => {
  await ctx.reply(
    '🕌 Времена намаза и уроки',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🕌 Намаз', `${WEB_APP_URL}/prayer`)],
    ])
  );
});

/**
 * About command
 */
bot.command('about', async (ctx: Context) => {
  const aboutMessage = `
ℹ️ *О MubarakWay*

MubarakWay — это современная исламская цифровая платформа, созданная для помощи мусульманам в их духовном развитии.

*Наши функции:*
📖 Коран с переводами и толкованиями
📚 Библиотека исламских книг
🎵 Нашиды
🕌 Уроки намаза
⏰ Времена молитв
🤖 AI-ассистент

*Технологии:*
• React + TypeScript
• Telegram Mini Apps
• Node.js + MongoDB
• AI от Anthropic

Версия: 1.0.0
© 2025 MubarakWay Team
  `;

  await ctx.replyWithMarkdownV2(
    aboutMessage.replace(/[-.!()]/g, '\\$&')
  );
});

/**
 * Callback query handler
 */
bot.action('about', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('ℹ️ Информация о приложении', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Открыть приложение', web_app: { url: WEB_APP_URL } }],
        [{ text: '📚 Документация', url: 'https://docs.mubarak-way.com' }],
      ],
    },
  });
});

/**
 * Handle any text message
 */
bot.on('text', async (ctx: Context) => {
  await ctx.reply(
    'Используйте команды или откройте приложение 👇',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Открыть MubarakWay', WEB_APP_URL)],
      [Markup.button.callback('📋 Команды', 'help')],
    ])
  );
});

/**
 * Error handler
 */
bot.catch((err, ctx) => {
  console.error('❌ Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже.');
});

/**
 * Start bot with webhook or polling
 */
export async function startBot() {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Use webhook in production
      const apiUrl = process.env.API_URL || 'https://mubarak-way-backend.onrender.com';
      const webhookUrl = `${apiUrl}/webhook/telegram`;
      console.log('🤖 Setting up Telegram webhook:', webhookUrl);

      await bot.telegram.setWebhook(webhookUrl);
      console.log('✅ Telegram webhook configured');
    } else {
      // Use polling in development
      console.log('🤖 Starting Telegram bot in polling mode...');
      await bot.launch();
      console.log('✅ Telegram bot started successfully');
    }

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    return bot;
  } catch (error) {
    console.error('❌ Failed to start Telegram bot:', error);
    throw error;
  }
}

/**
 * Stop bot
 */
export async function stopBot() {
  try {
    await bot.stop();
    console.log('🛑 Telegram bot stopped');
  } catch (error) {
    console.error('❌ Error stopping bot:', error);
  }
}

export default bot;

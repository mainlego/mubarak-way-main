/**
 * Enhanced Telegram Bot for MubarakWay
 * Features:
 * - Deep Links for downloading books and nashids
 * - Prayer notifications with interactive buttons
 * - Location tracking
 * - Full command set
 */

import { Telegraf, Markup } from 'telegraf';
import type { Context } from 'telegraf';
import type { Update } from 'telegraf/types';
import { config } from '../config/env.js';
import {
  calculatePrayerTimes,
  getCurrentAndNextPrayer,
  formatTime,
  getTimezoneFromCoordinates,
  type PrayerTimesResult,
} from './prayerTimes.js';
import {
  loadNotifiedPrayers,
  saveNotifiedPrayers,
  wasNotified,
  markAsNotified,
  clearNotifications,
} from './notifications.js';

// Import User model for database operations
import User from '../models/User.js';

// Bot configuration
const BOT_TOKEN = config.telegramBotToken;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://mubarak-way-frontend.onrender.com';

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

// Create bot instance
const bot = new Telegraf<Context<Update>>(BOT_TOKEN);

// Middleware for logging
bot.use((ctx, next) => {
  const user = ctx.from?.username || ctx.from?.first_name || 'Unknown';
  console.log(`${new Date().toISOString()} - ${ctx.updateType} from ${user}`);
  return next();
});

/**
 * Parse audio duration (3:45 -> 225 seconds)
 */
function parseDuration(durationStr: string | undefined): number {
  if (!durationStr) return 0;
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
}

// ============================================================================
// START COMMAND with Deep Links
// ============================================================================

bot.start(async (ctx) => {
  const firstName = ctx.from?.first_name || 'Друг';
  const startPayload = (ctx as any).startPayload;

  console.log(`[/start] User ${ctx.from?.id} (${firstName}), payload: ${startPayload}`);

  // Handle Deep Link for book download
  if (startPayload && startPayload.startsWith('download_book_')) {
    const bookId = parseInt(startPayload.replace('download_book_', ''));
    await handleBookDownload(ctx, bookId);
    return;
  }

  // Handle Deep Link for nashid download
  if (startPayload && startPayload.startsWith('download_')) {
    const nashidId = parseInt(startPayload.replace('download_', ''));
    await handleNashidDownload(ctx, nashidId);
    return;
  }

  // Regular welcome message
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp('🕌 Открыть MubarakWay', WEB_APP_URL)],
    [
      Markup.button.callback('📚 Библиотека', 'library'),
      Markup.button.callback('🎵 Нашиды', 'nashids'),
    ],
    [
      Markup.button.callback('🧭 Кибла', 'qibla'),
      Markup.button.callback('⏰ Время намаза', 'prayer_times'),
    ],
    [Markup.button.callback('📍 Установить локацию', 'set_location')],
    [Markup.button.callback('ℹ️ О проекте', 'about')],
  ]);

  const message = `🕌 *Ассаламу алейкум, ${firstName}!*

Добро пожаловать в *MubarakWay* — ваш духовный помощник и путеводитель в мире ислама.

🌟 *Что вас ждет:*

📚 *Библиотека* — исламские книги с встроенной читалкой
• Священный Коран с переводами
• Сборники хадисов
• Духовная литература
• Возможность чтения оффлайн

🎵 *Нашиды* — коллекция религиозных песнопений
• Классические и современные нашиды
• Создание персональных плейлистов
• Прослушивание без интернета
• Тексты на арабском и русском

🧭 *Определение киблы*
• Точное направление на Мекку
• Интерактивный компас
• Работает в любой точке мира

⏰ *Время молитв*
• Автоматический расчет по вашей локации
• Напоминания о начале намаза
• Хиджрийский календарь

💎 *Особенности:*
✅ Полностью бесплатное использование
✅ Работает без интернета
✅ Поддержка арабского языка
✅ Красивый и понятный интерфейс

Нажмите кнопку ниже, чтобы начать духовное путешествие! 🚀

*Barakallahu feeki!* 🤲`;

  await ctx.replyWithMarkdown(message, keyboard);
});

// ============================================================================
// DEEP LINKS HANDLERS
// ============================================================================

/**
 * Handle book download
 */
async function handleBookDownload(ctx: Context, bookId: number): Promise<void> {
  try {
    await ctx.reply('⏳ Загружаю книгу из базы данных...');

    // TODO: Load from MongoDB (Book model)
    // For now using mock data
    const mockBooks = [
      {
        id: 1,
        title: 'Священный Коран',
        author: 'Перевод смыслов',
        content: '# Священный Коран\n\nПеревод смыслов Священного Корана...\n\n## Сура Аль-Фатиха\n\n1. Во имя Аллаха, Милостивого, Милосердного...',
      },
      {
        id: 2,
        title: '40 хадисов Имама ан-Навави',
        author: 'Имам ан-Навави',
        content: '# 40 хадисов Имама ан-Навави\n\nСборник важнейших хадисов...',
      },
      {
        id: 3,
        title: 'Рияд ас-Салихин',
        author: 'Имам ан-Навави',
        content: '# Рияд ас-Салихин\n\nСады праведных...',
      },
    ];

    const book = mockBooks.find((b) => b.id === bookId);

    if (!book) {
      await ctx.reply('❌ Книга не найдена. Попробуйте выбрать другую.');
      return;
    }

    // Create text file from book content
    const bookContent = `${book.title}\n${'='.repeat(book.title.length)}\n\n${book.author ? `Автор: ${book.author}\n\n` : ''}${book.content}`;
    const buffer = Buffer.from('\uFEFF' + bookContent, 'utf-8'); // UTF-8 BOM

    // Send document
    await ctx.replyWithDocument(
      {
        source: buffer,
        filename: `${book.title}.txt`,
      },
      {
        caption: `📖 *${book.title}*${book.author ? `\n👤 ${book.author}` : ''}\n\n_Отправлено из MubarakWay_`,
        parse_mode: 'Markdown',
      }
    );

    await ctx.reply('✅ Книга сохранена в чате! Можете читать в любое время 📚');
  } catch (error) {
    console.error('Error sending book:', error);
    await ctx.reply('❌ Произошла ошибка при отправке книги. Попробуйте позже.');
  }
}

/**
 * Handle nashid download
 */
async function handleNashidDownload(ctx: Context, nashidId: number): Promise<void> {
  try {
    await ctx.reply('⏳ Загружаю нашид из базы данных...');

    // TODO: Load from MongoDB (Nashid model)
    // For now using mock data
    const mockNashids = [
      {
        id: 1,
        title: 'يا قلب من حديد',
        titleTransliteration: 'Ya Qalb Min Hadid',
        artist: 'Fadil Muhammad',
        duration: '3:45',
        audioUrl: '/audio/Nasheed_Azan_1.mp3',
      },
      {
        id: 2,
        title: 'سوف أعود يا أمي',
        titleTransliteration: 'Sauf A\'ood Ya Ommi',
        artist: 'Al-Baraah Group',
        duration: '4:20',
        audioUrl: '/audio/Nasheed_Azan_1.mp3',
      },
    ];

    const nashid = mockNashids.find((n) => n.id === nashidId);

    if (!nashid) {
      await ctx.reply('❌ Нашид не найден. Попробуйте выбрать другой.');
      return;
    }

    // Send audio file
    const audioUrl = `${WEB_APP_URL}${nashid.audioUrl}`;

    await ctx.replyWithAudio(audioUrl, {
      title: nashid.title,
      performer: nashid.artist,
      duration: parseDuration(nashid.duration),
      caption: `🎵 *${nashid.title}*\n👤 ${nashid.artist}\n\n_Отправлено из MubarakWay_`,
      parse_mode: 'Markdown',
    });

    await ctx.reply('✅ Нашид сохранён в чате! Можете слушать прямо здесь 🎧');
  } catch (error) {
    console.error('Error sending nashid:', error);
    await ctx.reply('❌ Произошла ошибка при отправке нашида. Попробуйте позже.');
  }
}

// ============================================================================
// CALLBACK QUERY HANDLERS
// ============================================================================

bot.action('library', (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithMarkdown(
    '📚 *Библиотека исламской литературы*\n\nОткройте приложение для доступа к духовным книгам и трактатам.',
    Markup.inlineKeyboard([[Markup.button.webApp('📖 Открыть библиотеку', `${WEB_APP_URL}/library`)]])
  );
});

bot.action('nashids', (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithMarkdown(
    '🎵 *Коллекция нашидов*\n\nСлушайте религиозные песнопения и создавайте персональные плейлисты.',
    Markup.inlineKeyboard([[Markup.button.webApp('🎶 Слушать нашиды', `${WEB_APP_URL}/library/nashids`)]])
  );
});

bot.action('qibla', (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithMarkdown(
    '🧭 *Направление киблы*\n\nОпределите точное направление на Мекку с помощью интерактивного компаса.',
    Markup.inlineKeyboard([[Markup.button.webApp('🕋 Найти киблу', `${WEB_APP_URL}/prayer/qibla`)]])
  );
});

bot.action('prayer_times', (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithMarkdown(
    '⏰ *Время молитв*\n\nАвтоматический расчет времени намаза по вашему местоположению.',
    Markup.inlineKeyboard([[Markup.button.webApp('🕐 Посмотреть время', `${WEB_APP_URL}/prayer/times`)]])
  );
});

bot.action('about', (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithMarkdown(
    `🌟 *О проекте MubarakWay*

*MubarakWay* — это комплексное исламское приложение, созданное для поддержки мусульман в их духовной практике.

👨‍💻 *Разработано с любовью*
Проект создан командой разработчиков-мусульман для всей уммы.

🆓 *Полностью бесплатно*
Все функции доступны без ограничений.

🔒 *Безопасность*
Ваши данные защищены и не передаются третьим лицам.

📧 *Поддержка*
По вопросам обращайтесь: support@mubarakway.com

*Да благословит Аллах всех, кто пользуется этим приложением!* 🤲

_Версия: 1.0.0_`,
    Markup.inlineKeyboard([[Markup.button.webApp('🚀 Открыть приложение', WEB_APP_URL)]])
  );
});

bot.action('set_location', (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithMarkdown(
    `📍 *Установка вашей локации*

Для точного расчета времени молитв нам нужна ваша геолокация.

Нажмите кнопку ниже, чтобы поделиться своим местоположением 👇`,
    Markup.keyboard([[Markup.button.locationRequest('📍 Отправить местоположение')]])
      .resize()
      .oneTime()
  );
});

// Prayer action buttons
bot.action(/^prayer_read_/, async (ctx) => {
  try {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.answerCbQuery('✅ Альхамдулиллах! Да примет Аллах твой намаз!');
    await ctx.reply(
      '🤲 Не забудьте совершить дуа после намаза.\n\nДа сделает Аллах ваши молитвы принятыми! 🌟',
      {
        reply_markup: {
          inline_keyboard: [[{ text: '↩️ Исправить', callback_data: 'show_prayer_menu' }]],
        },
      }
    );
  } catch (error) {
    console.error('Error in prayer_read action:', error);
  }
});

bot.action(/^prayer_not_read_/, async (ctx) => {
  try {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.answerCbQuery('Не откладывайте намаз!');
    await ctx.reply(
      '⚠️ Постарайтесь совершить намаз как можно скорее.\n\nМолитва - это столп ислама. Не пропускайте её без уважительной причины.',
      {
        reply_markup: {
          inline_keyboard: [[{ text: '↩️ Исправить', callback_data: 'show_prayer_menu' }]],
        },
      }
    );
  } catch (error) {
    console.error('Error in prayer_not_read action:', error);
  }
});

bot.action(/^prayer_makeup_/, async (ctx) => {
  try {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.answerCbQuery('📝 Записано в пропущенные');
    await ctx.reply(
      '📿 Намаз записан как пропущенный.\n\nНе забудьте восполнить его при первой возможности. Совершение пропущенных намазов - обязанность каждого мусульманина.',
      {
        reply_markup: {
          inline_keyboard: [[{ text: '↩️ Исправить', callback_data: 'show_prayer_menu' }]],
        },
      }
    );
  } catch (error) {
    console.error('Error in prayer_makeup action:', error);
  }
});

bot.action(/^prayer_mosque_/, async (ctx) => {
  try {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.answerCbQuery('🕌 Машаллах!');
    await ctx.reply(
      '🕌 Прекрасно, что совершаете намаз в мечети!\n\nНамаз в коллективе в 27 раз лучше намаза в одиночестве.\n\nДа воздаст Аллах вам за это! 🤲',
      {
        reply_markup: {
          inline_keyboard: [[{ text: '↩️ Исправить', callback_data: 'show_prayer_menu' }]],
        },
      }
    );
  } catch (error) {
    console.error('Error in prayer_mosque action:', error);
  }
});

// ============================================================================
// TEXT COMMANDS
// ============================================================================

bot.command('library', (ctx) => {
  ctx.replyWithMarkdown(
    '📚 *Библиотека исламских книг*',
    Markup.inlineKeyboard([[Markup.button.webApp('📖 Открыть', `${WEB_APP_URL}/library`)]])
  );
});

bot.command('nashids', (ctx) => {
  ctx.replyWithMarkdown(
    '🎵 *Нашиды и духовная музыка*',
    Markup.inlineKeyboard([[Markup.button.webApp('🎶 Слушать', `${WEB_APP_URL}/library/nashids`)]])
  );
});

bot.command('qibla', (ctx) => {
  ctx.replyWithMarkdown(
    '🧭 *Определение направления киблы*',
    Markup.inlineKeyboard([[Markup.button.webApp('🕋 Найти киблу', `${WEB_APP_URL}/prayer/qibla`)]])
  );
});

bot.command('prayer', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  try {
    // Get user from database
    const user = await User.findOne({ telegramId: userId.toString() });

    if (!user || !user.prayerSettings?.location?.latitude) {
      await ctx.reply('📍 Сначала установите свою локацию для расчета времени молитв.', {
        reply_markup: {
          inline_keyboard: [[{ text: '📍 Установить локацию', callback_data: 'set_location' }]],
        },
      });
      return;
    }

    const { latitude, longitude } = user.prayerSettings.location;
    const timezone = user.prayerSettings.location.timezone || 'Europe/Moscow';

    const prayerTimes = calculatePrayerTimes(
      latitude,
      longitude,
      new Date(),
      user.prayerSettings.calculationMethod,
      user.prayerSettings.madhab
    );

    if (!prayerTimes) {
      await ctx.reply('❌ Не удалось рассчитать время молитв.');
      return;
    }

    const today = new Date();
    const todayStr = today.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    let schedule = `🕌 *Время намаза на ${todayStr}*\n\n`;
    schedule += `🌅 Фаджр: ${formatTime(prayerTimes.fajr, timezone)}\n`;
    schedule += `🌄 Восход: ${formatTime(prayerTimes.sunrise, timezone)}\n`;
    schedule += `☀️ Зухр: ${formatTime(prayerTimes.dhuhr, timezone)}\n`;
    schedule += `🌤 Аср: ${formatTime(prayerTimes.asr, timezone)}\n`;
    schedule += `🌆 Магриб: ${formatTime(prayerTimes.maghrib, timezone)}\n`;
    schedule += `🌙 Иша: ${formatTime(prayerTimes.isha, timezone)}\n`;

    await ctx.replyWithMarkdown(schedule, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📅 Расписание на месяц', web_app: { url: `${WEB_APP_URL}/prayer/times` } }],
          [{ text: '🧭 Направление киблы', callback_data: 'qibla' }],
        ],
      },
    });
  } catch (error) {
    console.error('Error in /prayer command:', error);
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
});

bot.command('location', (ctx) => {
  ctx.replyWithMarkdown(
    `📍 *Установка локации*

Для точного расчета времени молитв нам нужна ваша геолокация.

Нажмите кнопку ниже, чтобы поделиться местоположением 👇`,
    Markup.keyboard([[Markup.button.locationRequest('📍 Отправить местоположение')]])
      .resize()
      .oneTime()
  );
});

bot.command('help', (ctx) => {
  ctx.replyWithMarkdown(`🆘 *Помощь по использованию*

*Доступные команды:*
/start - Главное меню
/prayer - Время намаза
/qibla - Направление киблы
/library - Библиотека книг
/nashids - Коллекция нашидов
/location - Установить локацию
/help - Эта справка

*Как пользоваться:*
1️⃣ Нажмите на любую кнопку меню
2️⃣ Откроется мини-приложение
3️⃣ Наслаждайтесь духовным контентом!

*Проблемы?*
Напишите нам: support@mubarakway.com`);
});

// ============================================================================
// LOCATION HANDLER
// ============================================================================

bot.on('location', async (ctx) => {
  const { latitude, longitude } = ctx.message.location;
  const userId = ctx.from?.id;

  if (!userId) return;

  console.log(`📍 [BOT] Received location from user ${userId}: ${latitude}, ${longitude}`);

  try {
    // Determine timezone
    const timezone = getTimezoneFromCoordinates(latitude, longitude);

    // Save to MongoDB
    let user = await User.findOne({ telegramId: userId.toString() });

    if (!user) {
      user = new User({
        telegramId: userId.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        prayerSettings: {
          location: {
            latitude,
            longitude,
            timezone,
          },
          notifications: {
            enabled: true,
            beforeMinutes: 10,
          },
        },
      });
      console.log(`✅ Created new user ${userId} with location`);
    } else {
      if (!user.prayerSettings) {
        user.prayerSettings = {
          calculationMethod: 'MuslimWorldLeague',
          madhab: 'hanafi',
          notifications: {
            enabled: true,
            beforeMinutes: 10,
          },
        };
      }
      user.prayerSettings.location = {
        latitude,
        longitude,
        city: user.prayerSettings.location?.city,
        country: user.prayerSettings.location?.country,
        timezone,
      };
      console.log(`✅ Updated location for user ${userId}`);
    }

    user.lastActive = new Date();
    await user.save();

    // Calculate prayer times
    const prayerTimes = calculatePrayerTimes(latitude, longitude);

    if (prayerTimes) {
      const { nextPrayer } = getCurrentAndNextPrayer(prayerTimes);

      await ctx.replyWithMarkdown(
        `✅ *Локация успешно сохранена!*

📍 Координаты: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
🌍 Часовой пояс: ${timezone}

⏰ *Время молитв на сегодня:*

🌅 Фаджр: ${formatTime(prayerTimes.fajr, timezone)}
🌄 Восход: ${formatTime(prayerTimes.sunrise, timezone)}
☀️ Зухр: ${formatTime(prayerTimes.dhuhr, timezone)}
🌤️ Аср: ${formatTime(prayerTimes.asr, timezone)}
🌆 Магриб: ${formatTime(prayerTimes.maghrib, timezone)}
🌙 Иша: ${formatTime(prayerTimes.isha, timezone)}

${nextPrayer ? `\n📿 Следующая молитва: *${nextPrayer.name}* в ${formatTime(nextPrayer.time, timezone)}` : ''}

🔔 Вы будете получать уведомления о времени молитв!`,
        Markup.removeKeyboard()
      );
    } else {
      await ctx.reply('❌ Не удалось рассчитать время молитв. Попробуйте еще раз.', Markup.removeKeyboard());
    }
  } catch (error) {
    console.error('Error saving location:', error);
    await ctx.reply('❌ Ошибка при сохранении локации. Попробуйте позже.', Markup.removeKeyboard());
  }
});

// ============================================================================
// TEXT MESSAGES
// ============================================================================

bot.on('text', (ctx) => {
  const text = ctx.message.text.toLowerCase();

  if (text.includes('салам') || text.includes('привет')) {
    ctx.reply('Ва алейкум ассалам! 🕌 Используйте /start для открытия главного меню.');
  } else if (text.includes('спасибо') || text.includes('шукран')) {
    ctx.reply('Баракаллаху фики! 🤲 Рады быть полезными.');
  } else if (text.includes('помощ') || text.includes('help')) {
    ctx.reply('Используйте /help для получения справки по командам.');
  } else {
    ctx.reply('Используйте /start для открытия главного меню MubarakWay! 🕌');
  }
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

bot.catch((err, ctx) => {
  console.error('❌ Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже или обратитесь в поддержку.');
});

// ============================================================================
// PRAYER NOTIFICATIONS SYSTEM
// ============================================================================

/**
 * Check prayer times and send notifications
 */
export async function checkPrayerNotifications(): Promise<void> {
  try {
    const now = new Date();

    // Get users with notifications enabled
    const users = await User.find({
      'prayerSettings.notifications.enabled': true,
      'prayerSettings.location.latitude': { $exists: true },
    });

    console.log(`🔍 Checking prayer times for ${users.length} users at ${now.toISOString()}`);

    if (users.length === 0) {
      return;
    }

    for (const user of users) {
      try {
        const userId = parseInt(user.telegramId);
        const location = user.prayerSettings?.location;
        const timezone = location?.timezone || 'Europe/Moscow';

        if (!location || !location.latitude || !location.longitude) {
          continue;
        }

        const prayerTimes = calculatePrayerTimes(
          location.latitude,
          location.longitude,
          now,
          user.prayerSettings?.calculationMethod,
          user.prayerSettings?.madhab
        );

        if (!prayerTimes) {
          continue;
        }

        const { nextPrayer } = getCurrentAndNextPrayer(prayerTimes);
        if (!nextPrayer) continue;

        const timeUntilNext = nextPrayer.time.getTime() - now.getTime();
        const minutesUntilNext = Math.floor(timeUntilNext / (1000 * 60));

        // 10-minute warning
        if (minutesUntilNext === 10) {
          const warningKey = `${userId}_${nextPrayer.key}_10min_${nextPrayer.time.getTime()}`;
          if (!wasNotified(warningKey) && !nextPrayer.skipNotification) {
            await bot.telegram.sendMessage(
              userId,
              `⏰ <b>Осталось 10 минут до молитвы ${nextPrayer.name}</b>\n\n` +
                `🕌 Время: ${formatTime(nextPrayer.time, timezone)}\n\n` +
                `Приготовьтесь к намазу.`,
              { parse_mode: 'HTML' }
            );
            markAsNotified(warningKey);
            console.log(`📢 Sent 10-min warning to user ${userId} for ${nextPrayer.name}`);
          }
        }

        // Prayer time notification
        if (minutesUntilNext === 0) {
          const prayerKey = `${userId}_${nextPrayer.key}_now_${nextPrayer.time.getTime()}`;
          if (!wasNotified(prayerKey) && !nextPrayer.skipNotification) {
            await bot.telegram.sendMessage(
              userId,
              `🕌 <b>Наступило время молитвы ${nextPrayer.name}</b>\n\n` +
                `🕐 ${formatTime(nextPrayer.time, timezone)}\n\n` +
                `Не откладывайте намаз!`,
              {
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: '✅ Прочитал', callback_data: `prayer_read_${nextPrayer.key}` },
                      { text: '❌ Не прочитал', callback_data: `prayer_not_read_${nextPrayer.key}` },
                    ],
                    [
                      { text: '📿 Восполню', callback_data: `prayer_makeup_${nextPrayer.key}` },
                      { text: '🕌 В мечети', callback_data: `prayer_mosque_${nextPrayer.key}` },
                    ],
                  ],
                },
              }
            );
            markAsNotified(prayerKey);
            console.log(`📢 Sent prayer notification to user ${userId} for ${nextPrayer.name}`);
          }
        }
      } catch (error) {
        console.error(`Error sending notification to user ${user.telegramId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in checkPrayerNotifications:', error);
  }
}

export default bot;

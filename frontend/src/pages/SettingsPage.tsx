import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@shared/store';
import { Card, Button } from '@shared/ui';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();

  const [isUpdating, setIsUpdating] = useState(false);

  // Get subscription limits based on tier
  const getSubscriptionLimits = (tier: 'free' | 'pro' | 'premium') => {
    switch (tier) {
      case 'free':
        return {
          aiRequests: 5,
          offlineBooks: 3,
          favoriteBooks: 10,
        };
      case 'pro':
        return {
          aiRequests: 50,
          offlineBooks: 20,
          favoriteBooks: 100,
        };
      case 'premium':
        return {
          aiRequests: -1, // unlimited
          offlineBooks: -1,
          favoriteBooks: -1,
        };
      default:
        return {
          aiRequests: 5,
          offlineBooks: 3,
          favoriteBooks: 10,
        };
    }
  };

  const handleLanguageChange = async (language: string) => {
    setIsUpdating(true);
    try {
      await i18n.changeLanguage(language);
      if (user) {
        await updateUser({
          preferences: {
            ...user.preferences,
            language: language as 'ru' | 'en' | 'ar',
          },
        });
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setIsUpdating(true);
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System theme
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      if (user) {
        await updateUser({
          preferences: {
            ...user.preferences,
            theme,
          },
        });
      }
    } catch (error) {
      console.error('Failed to change theme:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="page-container p-4">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('errors.unauthorized')}
          </p>
        </div>
      </div>
    );
  }

  const currentLanguage = user.preferences?.language || i18n.language;
  const currentTheme = user.preferences?.theme || 'system';
  const limits = getSubscriptionLimits(user.subscription.tier);

  return (
    <div className="page-container p-4 pb-32">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ⚙️ {t('settings.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('settings.description', { defaultValue: 'Manage your preferences' })}
        </p>
      </header>

      {/* User Info */}
      <Card className="mb-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center p-2">
            <img src="/logo.svg" alt="Mubarak Way" className="w-full h-full" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              @{user.username || user.telegramId}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                user.subscription.tier === 'free'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : user.subscription.tier === 'pro'
                  ? 'bg-blue-200 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              }`}>
                {user.subscription.tier.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('settings.preferences')}
        </h2>

        <div className="space-y-3">
          {/* Language */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              🌐 {t('settings.language')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                { code: 'en', name: 'English', flag: '🇬🇧' },
                { code: 'ar', name: 'العربية', flag: '🇸🇦' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isUpdating}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentLanguage === lang.code
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Theme */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              🎨 {t('settings.theme')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light', label: t('settings.light'), icon: '☀️' },
                { value: 'dark', label: t('settings.dark'), icon: '🌙' },
                { value: 'system', label: t('settings.system', { defaultValue: 'System' }), icon: '💻' },
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleThemeChange(theme.value as any)}
                  disabled={isUpdating}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentTheme === theme.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {theme.icon} {theme.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Subscription */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('settings.subscription')}
        </h2>

        <Card className={`${
          user.subscription.tier === 'free'
            ? 'border-2 border-gray-300 dark:border-gray-600'
            : user.subscription.tier === 'pro'
            ? 'border-2 border-blue-500'
            : 'border-2 border-yellow-500'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t(`subscription.${user.subscription.tier}`)} Plan
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.subscription.tier === 'free'
                  ? t('subscription.freeDesc', { defaultValue: 'Basic features' })
                  : user.subscription.tier === 'pro'
                  ? t('subscription.proDesc', { defaultValue: 'All features unlocked' })
                  : t('subscription.premiumDesc', { defaultValue: 'Premium experience' })
                }
              </p>
            </div>
            {user.subscription.tier === 'free' && (
              <Button size="sm" onClick={() => navigate('/subscription')}>
                {t('settings.upgrade')}
              </Button>
            )}
          </div>

          {/* Usage */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('progress.aiRequests', { defaultValue: 'AI Requests' })}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.usage.aiRequestsPerDay} / {limits.aiRequests === -1 ? '∞' : limits.aiRequests}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600"
                  style={{
                    width: limits.aiRequests === -1
                      ? '100%'
                      : `${Math.min((user.usage.aiRequestsPerDay / limits.aiRequests) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('library.offline', { defaultValue: 'Offline' })} {t('library.books', { defaultValue: 'Books' })}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.offline.books.length} / {limits.offlineBooks === -1 ? '∞' : limits.offlineBooks}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-600"
                  style={{
                    width: limits.offlineBooks === -1
                      ? '100%'
                      : `${Math.min((user.offline.books.length / limits.offlineBooks) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Prayer Settings */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('prayer.prayerSettings')}
        </h2>

        <div className="space-y-2">
          <Card hoverable onClick={() => navigate('/prayer/times')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t('prayer.prayerTimes', { defaultValue: 'Prayer Times' })}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('prayer.monthlySchedule', { defaultValue: 'Monthly schedule & reminders' })}
                  </p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Card>

          <Card hoverable onClick={() => navigate('/prayer/qibla')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧭</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t('prayer.qibla', { defaultValue: 'Qibla Compass' })}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('prayer.findDirection', { defaultValue: 'Find prayer direction' })}
                  </p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Card>

          <Card hoverable onClick={() => navigate('/settings/prayer')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕌</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t('settings.madhab')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.prayerSettings?.madhab || 'Hanafi'}
                  </p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Card>

          <Card hoverable onClick={() => navigate('/settings/notifications')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t('settings.notifications')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('prayer.prayerReminders', { defaultValue: 'Prayer reminders' })}
                  </p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Card>
        </div>
      </section>

      {/* About */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('settings.about')}
        </h2>

        <div className="space-y-2">
          <Card hoverable>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t('settings.version')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    1.0.0
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card hoverable>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t('settings.support', { defaultValue: 'Support' })}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    support@mubarakway.com
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@shared/store';
import { getTelegramUser } from '@shared/lib/telegram';
import { Card, Button } from '@shared/ui';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, login, isLoading } = useUserStore();

  useEffect(() => {
    const telegramUser = getTelegramUser();

    // Auto-login if we have Telegram user but no app user
    if (telegramUser && !user && !isLoading) {
      login().catch(console.error);
    }
  }, [user, login, isLoading]);

  return (
    <div className="page-container p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🕌 {t('common.appName')}
        </h1>
        {user && (
          <p className="text-gray-600 dark:text-gray-400">
            {t('greeting.assalamu')}, {user.firstName}!
          </p>
        )}
      </header>

      {/* Welcome Card */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {t('greeting.welcome')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Единая исламская платформа для чтения Корана, изучения намаза и доступа к исламской библиотеке.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/quran')}
            className="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="text-2xl mb-1">📖</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('navigation.quran')}
            </div>
          </button>
          <button
            onClick={() => navigate('/library')}
            className="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="text-2xl mb-1">📚</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('navigation.library')}
            </div>
          </button>
          <button
            onClick={() => navigate('/prayer')}
            className="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="text-2xl mb-1">🕌</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('navigation.prayer')}
            </div>
          </button>
        </div>
      </Card>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('subscription.features')}
        </h3>

        <Card hoverable onClick={() => navigate('/ai')}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">🤖</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('ai.assistant')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Задавайте вопросы о Коране и исламе
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="text-3xl">📱</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('library.offline')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Скачивайте контент для чтения без интернета
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌙</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('settings.theme')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Комфортное чтение в любое время суток
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Banner (for free users) */}
      {user && user.subscription.tier === 'free' && (
        <Card className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <h4 className="font-semibold mb-2">{t('subscription.upgradeToPro')}</h4>
          <p className="text-sm mb-3 opacity-90">
            Получите неограниченный доступ ко всем функциям
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/settings/subscription')}
          >
            {t('settings.upgrade')}
          </Button>
        </Card>
      )}

      {/* Status Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-200 text-center">
          ⚙️ {t('settings.version')} 1.0.0
        </p>
      </div>
    </div>
  );
}

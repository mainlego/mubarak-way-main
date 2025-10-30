import React from 'react';
import { useTranslation } from 'react-i18next';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'favorites' | 'offline' | 'category' | 'general';
  currentTier: 'free' | 'pro' | 'premium';
  limit?: number;
  category?: string;
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  isOpen,
  onClose,
  type,
  currentTier,
  limit,
  category,
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language as 'ru' | 'en' | 'ar';

  const getTitleByType = () => {
    switch (type) {
      case 'favorites':
        return t('upgrade.favoritesLimit.title', 'Достигнут лимит избранного');
      case 'offline':
        return t('upgrade.offlineLimit.title', 'Достигнут лимит офлайн загрузок');
      case 'category':
        return t('upgrade.categoryLimit.title', 'Достигнут лимит категории');
      default:
        return t('upgrade.general.title', 'Улучшите свою подписку');
    }
  };

  const getDescriptionByType = () => {
    switch (type) {
      case 'favorites':
        return t(
          'upgrade.favoritesLimit.description',
          `Вы достигли лимита избранных нашидов (${limit}). Улучшите подписку для неограниченного доступа.`
        );
      case 'offline':
        return t(
          'upgrade.offlineLimit.description',
          `Вы достигли лимита офлайн загрузок (${limit}). Улучшите подписку для неограниченного доступа.`
        );
      case 'category':
        return t(
          'upgrade.categoryLimit.description',
          `Вы достигли лимита для категории "${category}" (${limit} нашидов). Улучшите подписку для снятия ограничений.`
        );
      default:
        return t(
          'upgrade.general.description',
          'Получите доступ ко всем функциям и контенту без ограничений.'
        );
    }
  };

  const plans: Array<{
    tier: 'pro' | 'premium';
    name: { ru: string; en: string; ar: string };
    price: string;
    period: { ru: string; en: string; ar: string };
    features: Array<{ ru: string; en: string; ar: string }>;
    highlight?: boolean;
  }> = [
    {
      tier: 'pro' as const,
      name: {
        ru: 'Мутахсин (PRO)',
        en: 'Mutahsin (PRO)',
        ar: 'محسن (PRO)',
      },
      price: '299₽',
      period: {
        ru: 'в месяц',
        en: 'per month',
        ar: 'شهرياً',
      },
      features: [
        {
          ru: '✅ Неограниченное избранное',
          en: '✅ Unlimited favorites',
          ar: '✅ مفضلات غير محدودة',
        },
        {
          ru: '✅ 100 офлайн нашидов',
          en: '✅ 100 offline nashids',
          ar: '✅ ١٠٠ نشيد دون اتصال',
        },
        {
          ru: '✅ Без лимитов по категориям',
          en: '✅ No category limits',
          ar: '✅ بلا حدود للفئات',
        },
        {
          ru: '✅ Фоновое воспроизведение',
          en: '✅ Background playback',
          ar: '✅ تشغيل في الخلفية',
        },
        {
          ru: '✅ 100 AI запросов/день',
          en: '✅ 100 AI requests/day',
          ar: '✅ ١٠٠ طلب AI يومياً',
        },
      ],
      highlight: currentTier === 'free',
    },
    {
      tier: 'premium' as const,
      name: {
        ru: 'Сахиб аль-Вакф (Premium)',
        en: 'Sahib al-Waqf (Premium)',
        ar: 'صاحب الوقف (Premium)',
      },
      price: '599₽',
      period: {
        ru: 'в месяц',
        en: 'per month',
        ar: 'شهرياً',
      },
      features: [
        {
          ru: '✅ Всё из PRO',
          en: '✅ Everything from PRO',
          ar: '✅ كل ما في PRO',
        },
        {
          ru: '🔥 Неограниченный офлайн доступ',
          en: '🔥 Unlimited offline access',
          ar: '🔥 وصول غير محدود دون اتصال',
        },
        {
          ru: '🔥 Эксклюзивный контент',
          en: '🔥 Exclusive content',
          ar: '🔥 محتوى حصري',
        },
        {
          ru: '🔥 AI рекомендации',
          en: '🔥 AI recommendations',
          ar: '🔥 توصيات AI',
        },
        {
          ru: '🔥 Ранний доступ к новинкам',
          en: '🔥 Early access to new content',
          ar: '🔥 وصول مبكر للمحتوى الجديد',
        },
        {
          ru: '👨‍👩‍👧 До 3 профилей семьи',
          en: '👨‍👩‍👧 Up to 3 family profiles',
          ar: '👨‍👩‍👧 حتى ٣ ملفات عائلية',
        },
      ],
      highlight: false,
    },
  ];

  const handleUpgrade = (tier: 'pro' | 'premium') => {
    // TODO: Implement subscription upgrade flow
    console.log('Upgrade to:', tier);
    // This should trigger Telegram payment or redirect to subscription page
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
          >
            ✕
          </button>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {getTitleByType()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {getDescriptionByType()}
          </p>
        </div>

        {/* Current Tier Badge */}
        {currentTier && (
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
              <span>📊</span>
              <span>
                {t('subscription.currentTier', 'Текущий тариф')}:{' '}
                <strong>
                  {currentTier === 'free' && (language === 'ru' ? 'Муслим (Базовый)' : 'Muslim (Basic)')}
                  {currentTier === 'pro' && (language === 'ru' ? 'Мутахсин (PRO)' : 'Mutahsin (PRO)')}
                  {currentTier === 'premium' && (language === 'ru' ? 'Сахиб аль-Вакф (Premium)' : 'Sahib al-Waqf (Premium)')}
                </strong>
              </span>
            </span>
          </div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`rounded-xl border-2 p-6 transition-all ${
                plan.highlight
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Plan Badge */}
              {plan.highlight && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                    {t('subscription.recommended', 'Рекомендуем')} ⭐
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name[language]}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {plan.price}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  {plan.period[language]}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                  >
                    <span className="flex-shrink-0">{feature[language]}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(plan.tier)}
                disabled={
                  (plan.tier === 'pro' && currentTier !== 'free') ||
                  (plan.tier === 'premium' && currentTier === 'premium')
                }
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {(plan.tier === 'pro' && currentTier !== 'free') ||
                (plan.tier === 'premium' && currentTier === 'premium')
                  ? t('subscription.current', 'Текущий тариф')
                  : t('subscription.choose', 'Выбрать')}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm underline"
          >
            {t('common.cancel', 'Отмена')}
          </button>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
            💡 {t('subscription.note', 'Все платежи безопасны и обрабатываются через Telegram Payments')}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePromptModal;

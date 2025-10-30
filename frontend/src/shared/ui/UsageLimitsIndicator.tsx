import React from 'react';
import { useTranslation } from 'react-i18next';

interface UsageLimitsIndicatorProps {
  current: number;
  limit: number;
  type: 'favorites' | 'offline';
  category?: string;
  compact?: boolean;
  showUpgradePrompt?: () => void;
}

export const UsageLimitsIndicator: React.FC<UsageLimitsIndicatorProps> = ({
  current,
  limit,
  type,
  category,
  compact = false,
  showUpgradePrompt,
}) => {
  const { t } = useTranslation();

  // Calculate percentage
  const percentage = limit === -1 ? 100 : Math.min((current / limit) * 100, 100);
  const remaining = limit === -1 ? Infinity : Math.max(0, limit - current);
  const isUnlimited = limit === -1;
  const isNearLimit = percentage >= 80 && !isUnlimited;
  const isAtLimit = current >= limit && !isUnlimited;

  // Color based on usage
  const getColor = () => {
    if (isUnlimited) return 'text-purple-600 dark:text-purple-400';
    if (isAtLimit) return 'text-red-600 dark:text-red-400';
    if (isNearLimit) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = () => {
    if (isUnlimited) return 'bg-purple-500';
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const typeLabel = type === 'favorites'
    ? t('library.favorites', 'Избранное')
    : t('library.offline', 'Офлайн');

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className={`font-medium ${getColor()}`}>
          {isUnlimited ? '∞' : `${current}/${limit}`}
        </span>
        {!isUnlimited && (
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-[40px]">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {type === 'favorites' ? '⭐' : '📥'}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {typeLabel}
              {category && ` (${category})`}
            </h3>
            {isUnlimited ? (
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                {t('subscription.unlimited', 'Неограниченно')} ♾️
              </p>
            ) : (
              <p className={`text-sm ${getColor()}`}>
                {isAtLimit ? (
                  <span className="font-medium">
                    {t('subscription.limitReached', 'Лимит исчерпан')} 🚫
                  </span>
                ) : (
                  <>
                    {t('subscription.remaining', 'Осталось')}: <strong>{remaining}</strong>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-bold ${getColor()}`}>
            {isUnlimited ? '∞' : current}
          </div>
          {!isUnlimited && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('subscription.of', 'из')} {limit}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {!isUnlimited && (
        <div className="mb-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
            {isNearLimit && !isAtLimit && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ {t('subscription.nearLimit', 'Почти заполнено')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {isAtLimit && showUpgradePrompt && (
        <button
          onClick={showUpgradePrompt}
          className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <span>⚡</span>
          <span>{t('subscription.upgrade', 'Улучшить подписку')}</span>
        </button>
      )}

      {/* Info for near limit */}
      {isNearLimit && !isAtLimit && (
        <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
          <p className="text-xs text-orange-800 dark:text-orange-200">
            💡 {t('subscription.upgradeHint', 'Улучшите подписку для неограниченного доступа')}
          </p>
        </div>
      )}
    </div>
  );
};

// Compact version for inline display
export const UsageBadge: React.FC<{
  current: number;
  limit: number;
  icon?: string;
}> = ({ current, limit, icon = '📊' }) => {
  const isUnlimited = limit === -1;
  const isAtLimit = current >= limit && !isUnlimited;
  const isNearLimit = (current / limit) >= 0.8 && !isUnlimited;

  const getBgColor = () => {
    if (isUnlimited) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    if (isAtLimit) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    if (isNearLimit) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBgColor()}`}>
      <span>{icon}</span>
      <span>{isUnlimited ? '∞' : `${current}/${limit}`}</span>
    </span>
  );
};

export default UsageLimitsIndicator;

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NetworkStatusIndicatorProps {
  position?: 'top' | 'bottom';
  compact?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  position = 'top',
  compact = false,
}) => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000); // Hide after 3 seconds
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setShowBanner(true);
      setWasOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Don't show banner if online and not recently reconnected
  if (isOnline && !showBanner) {
    return null;
  }

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
          isOnline
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
          }`}
        />
        <span>
          {isOnline
            ? t('network.online', 'Онлайн')
            : t('network.offline', 'Офлайн')}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        position === 'top' ? 'top-0' : 'bottom-0'
      } ${showBanner ? 'translate-y-0' : position === 'top' ? '-translate-y-full' : 'translate-y-full'}`}
    >
      <div
        className={`mx-auto max-w-md m-4 rounded-lg shadow-lg p-4 ${
          isOnline
            ? 'bg-green-500 text-white'
            : 'bg-orange-500 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            {isOnline ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.415m-1.414-1.415L3 3m8.293 8.293l1.414 1.414"
                />
              </svg>
            )}
          </div>

          {/* Message */}
          <div className="flex-1">
            <p className="font-semibold">
              {isOnline
                ? t('network.backOnline', 'Соединение восстановлено')
                : t('network.noConnection', 'Нет подключения')}
            </p>
            <p className="text-sm opacity-90">
              {isOnline
                ? t('network.backOnlineDesc', 'Вы снова онлайн')
                : t('network.offlineMode', 'Работает офлайн режим')}
            </p>
          </div>

          {/* Close button */}
          {isOnline && (
            <button
              onClick={() => setShowBanner(false)}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default NetworkStatusIndicator;

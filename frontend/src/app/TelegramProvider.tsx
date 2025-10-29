/**
 * TelegramProvider - Ensures Telegram WebApp SDK is loaded before rendering
 * This fixes the white screen issue in Telegram
 */

import { useEffect, useState, ReactNode } from 'react';

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('📱 TelegramProvider: Checking SDK...');

    // Check if we're in Telegram
    const checkTelegramReady = () => {
      if (window.Telegram?.WebApp) {
        console.log('✅ Telegram SDK loaded');
        setIsReady(true);
        return true;
      }
      return false;
    };

    // Try immediately
    if (checkTelegramReady()) {
      return;
    }

    // If not ready, wait for it
    console.log('⏳ Waiting for Telegram SDK...');
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max (50 * 100ms)

    const interval = setInterval(() => {
      attempts++;
      console.log(`🔄 Attempt ${attempts}/${maxAttempts}`);

      if (checkTelegramReady()) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        console.warn('⚠️ Telegram SDK not loaded after 5 seconds, proceeding anyway');
        clearInterval(interval);
        setIsReady(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('🎉 TelegramProvider: Ready! Rendering app...');
  return <>{children}</>;
};

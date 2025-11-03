/**
 * VersionChecker Component
 * Auto-checks for new versions and prompts user to update
 */

import { useEffect, useState } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { checkForUpdate } from '../lib/versionService';

const CURRENT_VERSION = '1.0.0'; // Should match package.json version
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DISMISSED_VERSION_KEY = 'mubarakway_dismissed_version';

interface VersionData {
  version: string;
  changes: string[];
}

export const VersionChecker: React.FC = () => {
  const [newVersion, setNewVersion] = useState<VersionData | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const performVersionCheck = async () => {
    try {
      const result = await checkForUpdate(CURRENT_VERSION);

      if (result.needsUpdate) {
        // Check if this version was already dismissed
        const dismissedVersion = localStorage.getItem(DISMISSED_VERSION_KEY);
        if (dismissedVersion !== result.currentVersion) {
          setNewVersion({
            version: result.currentVersion,
            changes: result.changes,
          });
          setShowNotification(true);
        }
      }
    } catch (error) {
      console.error('Error checking version:', error);
    }
  };

  useEffect(() => {
    // Check version on mount
    performVersionCheck();

    // Periodically check version
    const interval = setInterval(performVersionCheck, VERSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ Cache cleared');
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        console.log('✅ Service workers unregistered');
      }

      // Force reload with cache bypass
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      // Reload anyway
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    // Save that user dismissed this update
    if (newVersion) {
      localStorage.setItem(DISMISSED_VERSION_KEY, newVersion.version);
    }
    setShowNotification(false);
  };

  if (!showNotification || !newVersion) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-lg">
                Обновление {newVersion.version}
              </div>
              <div className="text-white/90 text-sm">
                Новые возможности доступны
              </div>
            </div>
            <button
              onClick={handleDismiss}
              disabled={isUpdating}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Changes List */}
        {newVersion.changes && newVersion.changes.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              ✨ Что нового:
            </div>
            <ul className="space-y-1.5">
              {newVersion.changes.map((change, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="text-primary-500 flex-shrink-0 mt-0.5">•</span>
                  <span className="flex-1">{change}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Обновление...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Обновить сейчас</span>
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionChecker;

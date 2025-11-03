import { useEffect, useState } from 'react';
import { VERSION_CONFIG, hasVersionChanged, clearCacheAndReload } from '@shared/config/version';

interface VersionCheckState {
  hasUpdate: boolean;
  isChecking: boolean;
  showUpdatePrompt: boolean;
}

/**
 * Hook to check for app version updates
 * Automatically prompts user to reload when new version is detected
 */
export const useVersionCheck = () => {
  const [state, setState] = useState<VersionCheckState>({
    hasUpdate: false,
    isChecking: false,
    showUpdatePrompt: false,
  });

  useEffect(() => {
    // Initial version check
    const checkVersion = () => {
      setState(prev => ({ ...prev, isChecking: true }));

      if (hasVersionChanged()) {
        setState(prev => ({
          ...prev,
          hasUpdate: true,
          showUpdatePrompt: true,
          isChecking: false,
        }));
      } else {
        setState(prev => ({ ...prev, isChecking: false }));
      }
    };

    // Check immediately
    checkVersion();

    // Set up periodic checks
    const interval = setInterval(checkVersion, VERSION_CONFIG.checkInterval);

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    setState(prev => ({ ...prev, showUpdatePrompt: false }));
    await clearCacheAndReload();
  };

  const dismissUpdate = () => {
    setState(prev => ({ ...prev, showUpdatePrompt: false }));
  };

  return {
    ...state,
    handleUpdate,
    dismissUpdate,
  };
};

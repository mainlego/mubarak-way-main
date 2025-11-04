/**
 * Telegram WebApp SDK utilities
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          query_id?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
          bot?: {
            username?: string;
          };
          auth_date?: number;
          hash?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        HapticFeedback: {
          impactOccurred: (
            style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
          ) => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
        sendData: (data: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text?: string;
          }>;
        }, callback?: (buttonId: string) => void) => void;
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
      };
    };
  }
}

/**
 * Initialize Telegram WebApp SDK
 */
export const initTelegramSDK = (): void => {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;

    // Expand the web app to full height
    tg.ready();
    tg.expand();

    // Disable closing confirmation by default
    tg.disableClosingConfirmation();

    console.log('Telegram WebApp initialized:', {
      version: tg.version,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
    });
  } else {
    console.warn('Telegram WebApp SDK not available');
  }
};

/**
 * Get Telegram user data
 */
export const getTelegramUser = () => {
  return window.Telegram?.WebApp?.initDataUnsafe?.user;
};

/**
 * Get Telegram init data (for backend authentication)
 */
export const getTelegramInitData = (): string => {
  return window.Telegram?.WebApp?.initData || '';
};

/**
 * Check if running inside Telegram
 */
export const isTelegram = (): boolean => {
  return Boolean(window.Telegram?.WebApp);
};

/**
 * Get Telegram color scheme
 */
export const getTelegramColorScheme = (): 'light' | 'dark' => {
  return window.Telegram?.WebApp?.colorScheme || 'light';
};

/**
 * Haptic feedback
 */
export const haptic = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  },
  notification: (type: 'error' | 'success' | 'warning') => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
  },
  selection: () => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  },
};

/**
 * Main Button utilities
 */
export const mainButton = {
  setText: (text: string) => {
    window.Telegram?.WebApp?.MainButton?.setText(text);
  },
  show: () => {
    window.Telegram?.WebApp?.MainButton?.show();
  },
  hide: () => {
    window.Telegram?.WebApp?.MainButton?.hide();
  },
  onClick: (callback: () => void) => {
    window.Telegram?.WebApp?.MainButton?.onClick(callback);
  },
  offClick: (callback: () => void) => {
    window.Telegram?.WebApp?.MainButton?.offClick(callback);
  },
  showProgress: () => {
    window.Telegram?.WebApp?.MainButton?.showProgress();
  },
  hideProgress: () => {
    window.Telegram?.WebApp?.MainButton?.hideProgress();
  },
};

/**
 * Back Button utilities
 */
export const backButton = {
  show: () => {
    window.Telegram?.WebApp?.BackButton?.show();
  },
  hide: () => {
    window.Telegram?.WebApp?.BackButton?.hide();
  },
  onClick: (callback: () => void) => {
    window.Telegram?.WebApp?.BackButton?.onClick(callback);
  },
  offClick: (callback: () => void) => {
    window.Telegram?.WebApp?.BackButton?.offClick(callback);
  },
};

/**
 * Open external link
 */
export const openLink = (url: string, tryInstantView = false): void => {
  window.Telegram?.WebApp?.openLink(url, { try_instant_view: tryInstantView });
};

/**
 * Close the mini app
 */
export const closeApp = (): void => {
  window.Telegram?.WebApp?.close();
};

/**
 * Show confirmation dialog
 */
export const showConfirm = (
  message: string,
  callback: (confirmed: boolean) => void
): void => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showConfirm(message, callback);
  } else {
    // Fallback for non-Telegram environment
    const confirmed = window.confirm(message);
    callback(confirmed);
  }
};

/**
 * Show alert dialog
 */
export const showAlert = (message: string): void => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(message);
  } else {
    // Fallback for non-Telegram environment
    window.alert(message);
  }
};

/**
 * Get bot username from init data
 */
export const getBotUsername = (): string => {
  // Try to get from initDataUnsafe
  const botUsername =
    (window.Telegram?.WebApp?.initDataUnsafe as any)?.bot?.username;
  // Fallback to default bot username (should be configured in env)
  return botUsername || import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'MubarakWayBot';
};

/**
 * Send book to bot via Deep Link
 */
export const sendBookToBot = (bookId: number, bookTitle: string): void => {
  const botUsername = getBotUsername();
  const deepLink = `https://t.me/${botUsername}?start=download_book_${bookId}`;

  showConfirm(`Отправить книгу "${bookTitle}" в чат с ботом?`, (confirmed) => {
    if (confirmed) {
      haptic.impact('light');
      openLink(deepLink);
    }
  });
};

/**
 * Send nashid to bot via Deep Link
 */
export const sendNashidToBot = (nashidId: number, nashidTitle: string): void => {
  const botUsername = getBotUsername();
  const deepLink = `https://t.me/${botUsername}?start=download_${nashidId}`;

  showConfirm(`Отправить нашид "${nashidTitle}" в чат с ботом?`, (confirmed) => {
    if (confirmed) {
      haptic.impact('light');
      openLink(deepLink);
    }
  });
};

/**
 * Share message via Telegram (forward to any chat)
 */
export const shareMessage = (text: string): void => {
  haptic.selection();

  if (window.Telegram?.WebApp) {
    // Use Telegram's native share URL
    // This opens the chat selector with pre-filled message
    const encodedText = encodeURIComponent(text);
    const shareUrl = `https://t.me/share/url?url=${encodedText}`;

    // Open the share dialog
    window.Telegram.WebApp.openTelegramLink(shareUrl);
  } else {
    // Fallback: use Web Share API or copy to clipboard
    if (navigator.share) {
      navigator.share({
        text: text,
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      });
    } else {
      // Final fallback: copy to clipboard
      navigator.clipboard.writeText(text).catch((error) => {
        console.error('Copy failed:', error);
      });
    }
  }
};

/**
 * Deep Links utilities
 */
export const deepLinks = {
  /**
   * Send book to bot chat
   */
  sendBook: sendBookToBot,

  /**
   * Send nashid to bot chat
   */
  sendNashid: sendNashidToBot,

  /**
   * Open bot chat
   */
  openBotChat: () => {
    const botUsername = getBotUsername();
    openLink(`https://t.me/${botUsername}`);
  },

  /**
   * Create custom deep link
   */
  createLink: (startParam: string): string => {
    const botUsername = getBotUsername();
    return `https://t.me/${botUsername}?start=${startParam}`;
  },
};

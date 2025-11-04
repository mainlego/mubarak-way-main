/**
 * Telegram WebApp Integration
 * Provides utilities for interacting with Telegram WebApp API
 */

// Type definitions for Telegram WebApp
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
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
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;

  // Methods
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, eventHandler: () => void) => void;
  offEvent: (eventType: string, eventHandler: () => void) => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type?: string; text?: string }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;

  // Haptic Feedback
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };

  // Main Button
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
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };

  // Back Button
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
}

/**
 * Get Telegram WebApp instance
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

/**
 * Check if app is running inside Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  return getTelegramWebApp() !== null;
}

/**
 * Initialize Telegram WebApp
 */
export function initTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    console.log('[TelegramWebApp] Initialized', {
      version: tg.version,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
    });
  }
}

/**
 * Send data to Telegram bot
 * @param data - Data to send (will be stringified if object)
 */
export function sendToBot(data: string | object) {
  const tg = getTelegramWebApp();
  if (tg) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    tg.sendData(dataString);
    console.log('[TelegramWebApp] Sent data to bot:', dataString);
  } else {
    console.warn('[TelegramWebApp] Not available - cannot send data');
  }
}

/**
 * Share nashid to Telegram chat
 * @param nashid - Nashid to share
 */
export function shareNashidToBot(nashid: {
  id: string | number;
  title: string;
  artist: string;
  audioUrl?: string;
}) {
  const tg = getTelegramWebApp();
  if (tg) {
    const shareUrl = `${window.location.origin}/library/nashids?play=${nashid.id}`;
    const message = `🎵 ${nashid.title}\n👤 ${nashid.artist}\n\n${shareUrl}`;

    // Use openTelegramLink to share in chat
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`);

    console.log('[TelegramWebApp] Sharing nashid:', nashid.title);
  } else {
    console.warn('[TelegramWebApp] Not available - cannot share');
  }
}

/**
 * Haptic Feedback Utilities
 */
export const haptic = {
  /**
   * Impact feedback - for UI interactions
   */
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    }
  },

  /**
   * Notification feedback - for status changes
   */
  notification: (type: 'error' | 'success' | 'warning') => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred(type);
    }
  },

  /**
   * Selection changed feedback - for picker changes
   */
  selectionChanged: () => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  },
};

/**
 * Show confirmation dialog
 */
export function showConfirm(
  message: string,
  callback?: (confirmed: boolean) => void
) {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.showConfirm(message, callback);
  } else {
    // Fallback to browser confirm
    const confirmed = window.confirm(message);
    if (callback) callback(confirmed);
  }
}

/**
 * Show alert dialog
 */
export function showAlert(message: string, callback?: () => void) {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.showAlert(message, callback);
  } else {
    // Fallback to browser alert
    window.alert(message);
    if (callback) callback();
  }
}

/**
 * Get user data from Telegram WebApp
 */
export function getTelegramUser() {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
}

/**
 * Get theme from Telegram WebApp
 */
export function getTelegramTheme(): 'light' | 'dark' {
  const tg = getTelegramWebApp();
  return tg?.colorScheme || 'light';
}

/**
 * Close WebApp
 */
export function closeTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.close();
  }
}

/**
 * Enable closing confirmation (prevents accidental closing)
 */
export function enableClosingConfirmation() {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.enableClosingConfirmation();
  }
}

/**
 * Disable closing confirmation
 */
export function disableClosingConfirmation() {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.disableClosingConfirmation();
  }
}

/**
 * Show main button with custom configuration
 */
export function showMainButton(
  text: string,
  onClick: () => void,
  options?: {
    color?: string;
    textColor?: string;
    isActive?: boolean;
  }
) {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    tg.MainButton.setParams({
      text,
      color: options?.color,
      text_color: options?.textColor,
      is_active: options?.isActive !== false,
      is_visible: true,
    });
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
  }
}

/**
 * Hide main button
 */
export function hideMainButton() {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    tg.MainButton.hide();
  }
}

/**
 * Show back button
 */
export function showBackButton(onClick: () => void) {
  const tg = getTelegramWebApp();
  if (tg?.BackButton) {
    tg.BackButton.onClick(onClick);
    tg.BackButton.show();
  }
}

/**
 * Hide back button
 */
export function hideBackButton() {
  const tg = getTelegramWebApp();
  if (tg?.BackButton) {
    tg.BackButton.hide();
  }
}

/**
 * Alias for isTelegramWebApp for backwards compatibility
 */
export const isTelegram = isTelegramWebApp;

/**
 * Deep Links API for sending content to Telegram bot
 */
export const deepLinks = {
  /**
   * Send book to Telegram bot via deep link
   */
  sendBookToBot: async (book: { id: string | number; title: string; author?: string }) => {
    const tg = getTelegramWebApp();
    if (!tg) {
      console.warn('[DeepLinks] Not in Telegram WebApp');
      return;
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      showConfirm(
        `Отправить книгу "${book.title}" в бот для скачивания?`,
        (result) => resolve(result)
      );
    });

    if (confirmed) {
      haptic.notification('success');
      const deepLinkUrl = `https://t.me/${import.meta.env.VITE_TELEGRAM_BOT_USERNAME}?start=book_${book.id}`;
      tg.openTelegramLink(deepLinkUrl);
      showAlert('Книга отправлена в бот! Откройте бот для скачивания.');
    }
  },

  /**
   * Send nashid to Telegram bot via deep link
   */
  sendNashidToBot: async (nashid: { id: string | number; title: string; artist: string }) => {
    const tg = getTelegramWebApp();
    if (!tg) {
      console.warn('[DeepLinks] Not in Telegram WebApp');
      return;
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      showConfirm(
        `Отправить нашид "${nashid.title}" в бот для скачивания?`,
        (result) => resolve(result)
      );
    });

    if (confirmed) {
      haptic.notification('success');
      const deepLinkUrl = `https://t.me/${import.meta.env.VITE_TELEGRAM_BOT_USERNAME}?start=nashid_${nashid.id}`;
      tg.openTelegramLink(deepLinkUrl);
      showAlert('Нашид отправлен в бот! Откройте бот для скачивания.');
    }
  },
};

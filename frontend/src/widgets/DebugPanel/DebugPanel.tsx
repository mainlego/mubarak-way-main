/**
 * Debug Panel Component
 * Shows app state, logs, and allows copying for troubleshooting
 */

import { useState, useEffect, useCallback } from 'react';
import { useUserStore, useQuranStore, useLibraryStore, usePrayerStore } from '@shared/store';
import { getTelegramUser, getTelegramInitData, isTelegram } from '@shared/lib/telegram';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  // Get all store states
  const userState = useUserStore();
  const quranState = useQuranStore();
  const libraryState = useLibraryStore();
  const prayerState = usePrayerStore();

  // Add log entry
  const addLog = useCallback((level: LogEntry['level'], message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
    setLogs(prev => [...prev.slice(-49), entry]); // Keep last 50 logs
  }, []);

  // Intercept console methods
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('info', args.join(' '), args.length > 1 ? args : args[0]);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args.join(' '), args.length > 1 ? args : args[0]);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args.join(' '), args.length > 1 ? args : args[0]);
    };

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    };
  }, [addLog]);

  // Generate debug report
  const generateReport = useCallback(() => {
    const telegramUser = getTelegramUser();
    const initData = getTelegramInitData();
    const inTelegram = isTelegram();

    const report = {
      timestamp: new Date().toISOString(),
      app: {
        version: '1.0.0',
        environment: import.meta.env.MODE,
        apiUrl: import.meta.env.VITE_API_BASE_URL,
      },
      telegram: {
        available: inTelegram,
        user: telegramUser ? {
          id: telegramUser.id,
          first_name: telegramUser.first_name,
          username: telegramUser.username,
          language_code: telegramUser.language_code,
        } : null,
        initData: initData ? `${initData.substring(0, 50)}...` : null,
        hasInitData: Boolean(initData),
        initDataLength: initData?.length || 0,
      },
      auth: {
        isAuthenticated: Boolean(userState.user),
        userId: userState.user?.id,
        telegramId: userState.user?.telegramId,
        username: userState.user?.username,
        isLoading: userState.isLoading,
        error: userState.error,
      },
      stores: {
        user: {
          hasUser: Boolean(userState.user),
          favorites: userState.user?.favorites,
          offline: userState.user?.offline,
        },
        quran: {
          surahsCount: quranState.surahs?.length || 0,
          currentSurah: quranState.currentSurah?.number,
          bookmarksCount: quranState.bookmarks?.length || 0,
        },
        library: {
          booksCount: libraryState.books?.length || 0,
          nashidsCount: libraryState.nashids?.length || 0,
        },
        prayer: {
          lessonsCount: prayerState.lessons?.length || 0,
          hasLocation: Boolean(prayerState.location),
        },
      },
      network: {
        online: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType,
      },
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
      },
      logs: logs.slice(-10), // Last 10 logs
    };

    return JSON.stringify(report, null, 2);
  }, [userState, quranState, libraryState, prayerState, logs]);

  // Copy report to clipboard
  const copyReport = useCallback(async () => {
    const report = generateReport();
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for Telegram WebApp
      const textarea = document.createElement('textarea');
      textarea.value = report;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generateReport]);

  // Toggle panel
  const togglePanel = () => setIsOpen(prev => !prev);

  if (!isOpen) {
    return (
      <button
        onClick={togglePanel}
        className="fixed bottom-20 right-4 z-50 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        aria-label="Open Debug Panel"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl h-[80vh] rounded-t-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🐛 Debug Panel
            <span className="text-sm font-normal text-gray-500">
              ({logs.length} logs)
            </span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={copyReport}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy Report'}
            </button>
            <button
              onClick={togglePanel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <StatusCard
              label="Telegram"
              value={isTelegram() ? '✓ Active' : '✗ Not Active'}
              color={isTelegram() ? 'green' : 'red'}
            />
            <StatusCard
              label="Auth"
              value={userState.user ? '✓ Logged In' : '✗ Not Logged In'}
              color={userState.user ? 'green' : 'red'}
            />
            <StatusCard
              label="Network"
              value={navigator.onLine ? '✓ Online' : '✗ Offline'}
              color={navigator.onLine ? 'green' : 'yellow'}
            />
            <StatusCard
              label="Logs"
              value={`${logs.length} entries`}
              color="blue"
            />
          </div>

          {/* Telegram Info */}
          <Section title="Telegram">
            <InfoRow label="Available" value={isTelegram() ? 'Yes' : 'No'} />
            <InfoRow label="User ID" value={getTelegramUser()?.id || 'N/A'} />
            <InfoRow label="Username" value={getTelegramUser()?.username || 'N/A'} />
            <InfoRow label="InitData Length" value={getTelegramInitData()?.length || 0} />
          </Section>

          {/* Auth Info */}
          <Section title="Authentication">
            <InfoRow label="Authenticated" value={userState.user ? 'Yes' : 'No'} />
            <InfoRow label="User ID" value={userState.user?.id || 'N/A'} />
            <InfoRow label="Telegram ID" value={userState.user?.telegramId || 'N/A'} />
            <InfoRow label="Loading" value={userState.isLoading ? 'Yes' : 'No'} />
            <InfoRow label="Error" value={userState.error || 'None'} />
          </Section>

          {/* Logs */}
          <Section title="Recent Logs">
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">No logs yet</p>
              ) : (
                logs.slice().reverse().map((log, index) => (
                  <LogRow key={index} log={log} />
                ))
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatusCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = {
    green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  };

  return (
    <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-sm font-bold mt-1">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-1 text-sm">
      <span className="text-gray-600 dark:text-gray-400">{label}:</span>
      <span className="text-gray-900 dark:text-white font-mono">{value}</span>
    </div>
  );
}

function LogRow({ log }: { log: LogEntry }) {
  const colors = {
    info: 'text-blue-600 dark:text-blue-400',
    warn: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="text-xs font-mono">
      <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
      {' '}
      <span className={colors[log.level]}>[{log.level.toUpperCase()}]</span>
      {' '}
      <span className="text-gray-900 dark:text-white">{log.message}</span>
    </div>
  );
}

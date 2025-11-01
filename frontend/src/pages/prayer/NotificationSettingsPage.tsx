/**
 * Notification Settings Page
 * Allows users to configure prayer notification preferences
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, Save } from 'lucide-react';
import { useUserStore } from '@shared/store';
import { Button, Card, Spinner } from '@shared/ui';

interface NotificationSettings {
  enabled: boolean;
  reminderBefore: number;
  atPrayerTime: boolean;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  telegramOnly: boolean;
}

const prayerNames: Record<keyof NotificationSettings['prayers'], string> = {
  fajr: 'Фаджр',
  dhuhr: 'Зухр',
  asr: 'Аср',
  maghrib: 'Магриб',
  isha: 'Иша',
};

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    reminderBefore: 10,
    atPrayerTime: true,
    prayers: {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    },
    telegramOnly: false,
  });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.telegramId) {
        setLoading(false);
        return;
      }

      try {
        // Load from user preferences
        if (user.prayerSettings?.notifications) {
          setSettings((prev) => ({
            ...prev,
            enabled: user.prayerSettings.notifications.enabled,
            reminderBefore: user.prayerSettings.notifications.beforeMinutes,
          }));
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user?.telegramId) return;

    setSaving(true);
    try {
      // Update user prayer settings
      await updateUser({
        prayerSettings: {
          ...user.prayerSettings,
          notifications: {
            enabled: settings.enabled,
            beforeMinutes: settings.reminderBefore,
          },
        },
      });

      alert('✅ Настройки сохранены');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert('❌ Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: keyof Omit<NotificationSettings, 'prayers'>) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrayer = (prayer: keyof NotificationSettings['prayers']) => {
    setSettings((prev) => ({
      ...prev,
      prayers: {
        ...prev.prayers,
        [prayer]: !prev.prayers[prayer],
      },
    }));
  };

  const setReminderTime = (minutes: number) => {
    setSettings((prev) => ({ ...prev, reminderBefore: minutes }));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-20 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Уведомления</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} variant="primary" size="sm">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Main Toggle */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Включить уведомления
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Общие уведомления о молитвах
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('enabled')}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`}
              />
            </button>
          </div>
        </Card>

        {settings.enabled && (
          <>
            {/* Reminder Time */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
                Напоминание до молитвы
              </h3>
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <span className="text-gray-900 dark:text-white">
                      За {settings.reminderBefore} минут
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 5, 10, 15, 30].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => setReminderTime(minutes)}
                        className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm font-medium ${
                          settings.reminderBefore === minutes
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {minutes === 0 ? 'Нет' : `${minutes}м`}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Prayer Time Notification */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
                При наступлении времени
              </h3>
              <Card>
                <button
                  onClick={() => toggleSetting('atPrayerTime')}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-gray-900 dark:text-white">Уведомлять в момент молитвы</span>
                  <div
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.atPrayerTime ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        settings.atPrayerTime ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </button>
              </Card>
            </div>

            {/* Individual Prayers */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
                Уведомления для молитв
              </h3>
              <Card className="divide-y divide-gray-200 dark:divide-gray-700">
                {(Object.entries(prayerNames) as [keyof typeof prayerNames, string][]).map(
                  ([key, name], index) => (
                    <button
                      key={key}
                      onClick={() => togglePrayer(key)}
                      className={`w-full flex items-center justify-between p-4 ${
                        index === 0 ? '' : ''
                      }`}
                    >
                      <span className="text-gray-900 dark:text-white">{name}</span>
                      <div
                        className={`w-12 h-6 rounded-full transition-colors ${
                          settings.prayers[key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                            settings.prayers[key] ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`}
                        />
                      </div>
                    </button>
                  )
                )}
              </Card>
            </div>

            {/* Telegram Only */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
                Канал уведомлений
              </h3>
              <Card>
                <button
                  onClick={() => toggleSetting('telegramOnly')}
                  className="w-full flex items-center justify-between"
                >
                  <div className="text-left">
                    <div className="text-gray-900 dark:text-white">Только в Telegram</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Отключить уведомления в приложении
                    </div>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
                      settings.telegramOnly ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        settings.telegramOnly ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </button>
              </Card>
            </div>
          </>
        )}

        {/* Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
          Уведомления приходят через Telegram бота.
          <br />
          Убедитесь, что установили локацию командой /location
        </div>
      </div>
    </div>
  );
}

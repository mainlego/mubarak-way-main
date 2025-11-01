import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initTelegramSDK, isTelegram } from '@shared/lib/telegram';
import { useUserStore } from '@shared/store';

// Pages
import HomePage from '@pages/HomePage';
import OnboardingPage from '@pages/OnboardingPage';

// Quran Pages
import {
  SurahListPage,
  SurahReaderPage,
  BookmarksPage,
  HistoryPage,
  AIChatPage,
} from '@pages/quran';

// Library Pages
import {
  LibraryPage,
  BookListPage,
  BookReaderPage,
  NashidListPage,
} from '@pages/library';

// Prayer Pages
import {
  PrayerPage,
  LessonListPage,
  LessonDetailPage,
  PrayerTimesPage,
  QiblaPage,
  PracticePage,
  PracticeSessionPage,
  WuduPage,
  NotificationSettingsPage,
} from '@pages/prayer';

// Progress & Settings Pages
import ProgressPage from '@pages/ProgressPage';
import SettingsPage from '@pages/SettingsPage';

// Admin Pages
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminBooksPage from '../pages/admin/AdminBooksPage';
import AdminNashidsPage from '../pages/admin/AdminNashidsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminAdminsPage from '../pages/admin/AdminAdminsPage';
import AdminSubscriptionsPage from '../pages/admin/AdminSubscriptionsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminLayout from '../widgets/admin/AdminLayout';

// Widgets
import BottomNav from '@widgets/BottomNav';
import DebugPanel from '@widgets/DebugPanel';
import { VersionChecker } from '@shared/ui';

function App() {
  const { login } = useUserStore();

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 App initializing...');

      // Initialize Telegram WebApp SDK
      initTelegramSDK();

      // Set theme based on Telegram theme
      const isDark = window.Telegram?.WebApp?.colorScheme === 'dark';
      if (isDark) {
        document.documentElement.classList.add('dark');
      }

      // Auto-login if in Telegram
      if (isTelegram()) {
        try {
          await login();
          console.log('✅ Auto-login successful');
        } catch (error) {
          console.error('❌ Auto-login failed:', error);
        }
      }
    };

    initializeApp();
  }, [login]);

  console.log('🎨 App rendering...');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Onboarding */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Main App */}
          <Route path="/" element={<HomePage />} />

          {/* Quran Module */}
          <Route path="/quran" element={<SurahListPage />} />
          <Route path="/quran/surah/:surahNumber" element={<SurahReaderPage />} />
          <Route path="/quran/bookmarks" element={<BookmarksPage />} />
          <Route path="/quran/history" element={<HistoryPage />} />
          <Route path="/quran/ai" element={<AIChatPage />} />
          <Route path="/ai" element={<AIChatPage />} />

          {/* Library Module */}
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/books" element={<BookListPage />} />
          <Route path="/library/books/:bookId" element={<BookReaderPage />} />
          <Route path="/library/nashids" element={<NashidListPage />} />

          {/* Prayer Module */}
          <Route path="/prayer" element={<PrayerPage />} />
          <Route path="/prayer/lessons" element={<LessonListPage />} />
          <Route path="/prayer/lessons/:lessonSlug" element={<LessonDetailPage />} />
          <Route path="/prayer/times" element={<PrayerTimesPage />} />
          <Route path="/prayer/qibla" element={<QiblaPage />} />
          <Route path="/prayer/practice" element={<PracticePage />} />
          <Route path="/prayer/practice/:lessonId" element={<PracticeSessionPage />} />
          <Route path="/prayer/wudu" element={<WuduPage />} />
          <Route path="/settings/notifications" element={<NotificationSettingsPage />} />

          {/* Progress & Settings */}
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Admin Panel */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="books" element={<AdminBooksPage />} />
            <Route path="nashids" element={<AdminNashidsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="admins" element={<AdminAdminsPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Debug Panel (only in development or when needed) */}
        <DebugPanel />

        {/* Version Checker - Auto-update notification */}
        <VersionChecker />
      </div>
    </BrowserRouter>
  );
}

export default App;

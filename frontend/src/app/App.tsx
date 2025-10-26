import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initTelegramSDK } from '@shared/lib/telegram';

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
} from '@pages/prayer';

// Progress & Settings Pages
import ProgressPage from '@pages/ProgressPage';
import SettingsPage from '@pages/SettingsPage';

// Widgets
import BottomNav from '@widgets/BottomNav';

function App() {
  useEffect(() => {
    // Initialize Telegram WebApp SDK
    initTelegramSDK();

    // Set theme based on Telegram theme
    const isDark = window.Telegram?.WebApp?.colorScheme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

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

          {/* Progress & Settings */}
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;

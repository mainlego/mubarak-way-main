import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Settings,
  Sun,
  Moon,
  Type,
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Download,
  Share2,
  Volume2,
  VolumeX,
  CloudDownload,
  HardDrive,
  Wifi,
  WifiOff
} from 'lucide-react';
import { getApiUrl } from '../../shared/lib/apiConfig';
import {
  offlineBooks,
  readingProgress as offlineReadingProgress,
  type OfflineBook
} from '../../shared/lib/offlineStorage';
import {
  useOfflineBooks,
  useReadingProgress,
  useNetworkStatus
} from '../../shared/hooks/useOffline';

// Types
interface Book {
  _id?: string;
  id: string | number;
  title: string;
  author?: string;
  content: string;
  extractedText?: string;
  description?: string;
  cover?: string;
  category?: string;
  isPro?: boolean;
}

interface ReaderSettings {
  isDarkTheme: boolean;
  fontSize: number;
  lineHeight: number;
  isPageMode: boolean;
  speechRate: number;
}

interface Bookmarks {
  [bookId: string]: {
    page: number;
    progress: number;
    scrollPosition: number;
    timestamp: number;
  };
}

interface TouchPosition {
  start: number | null;
  end: number | null;
}

const API_URL = getApiUrl();

const EnhancedBookReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  // Book state
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  // Reader settings
  const [settings, setSettings] = useState<ReaderSettings>({
    isDarkTheme: false,
    fontSize: 18,
    lineHeight: 1.8,
    isPageMode: true,
    speechRate: 1
  });
  const [showSettings, setShowSettings] = useState(false);

  // Reading state
  const [readingProgressValue, setReadingProgressValue] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isGuideMode, setIsGuideMode] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pages, setPages] = useState<string[]>([]);
  const [pageTransition, setPageTransition] = useState('');
  const [nextPageContent, setNextPageContent] = useState('');
  const [flippingPageContent, setFlippingPageContent] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);

  // Offline hooks
  const { isOnline } = useNetworkStatus();
  const { isBookOffline, saveBook: saveOfflineBook, removeBook: removeOfflineBook } = useOfflineBooks();
  const { saveProgress } = useReadingProgress(id);
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);

  // Touch navigation
  const [touch, setTouch] = useState<TouchPosition>({ start: null, end: null });

  // Load book data
  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Try to load from API
        const response = await axios.get(`${API_URL}/books/${id}`);

        if (response.data.success && response.data.book) {
          const fetchedBook = response.data.book;

          const bookData: Book = {
            ...fetchedBook,
            id: fetchedBook._id || id,
            content: fetchedBook.extractedText || fetchedBook.content || ''
          };

          console.log('[EnhancedBookReader] Book loaded:', bookData.title);
          setBook(bookData);

          if (bookData.content) {
            splitContentIntoPages(bookData.content);
          }
        }
      } catch (error) {
        console.error('[EnhancedBookReader] Failed to fetch book:', error);

        // Try offline storage if online fetch fails
        if (!isOnline) {
          const offlineBook = await offlineBooks.getBook(id);
          if (offlineBook && offlineBook.content) {
            const bookData: Book = {
              id: offlineBook.bookId,
              title: offlineBook.title,
              author: offlineBook.author,
              content: offlineBook.content,
              description: offlineBook.description,
              cover: offlineBook.cover,
              category: offlineBook.category,
              isPro: offlineBook.isPro
            };
            setBook(bookData);
            splitContentIntoPages(bookData.content);
          }
        }
      } finally {
        setLoading(false);
      }

      // Check offline availability
      if (id) {
        const offline = await isBookOffline(id);
        setIsOfflineAvailable(offline);
      }
    };

    loadBook();
    const searchParams = new URLSearchParams(location.search);
    setIsGuideMode(searchParams.get('guide') === 'true');
  }, [id, location.search, isOnline]);

  // Load saved settings
  useEffect(() => {
    if (!id) return;

    const savedTheme = localStorage.getItem('readerTheme');
    const savedFontSize = localStorage.getItem('readerFontSize');
    const savedLineHeight = localStorage.getItem('readerLineHeight');
    const savedPageMode = localStorage.getItem('readerPageMode');
    const savedBookmarks = localStorage.getItem('bookmarks');
    const savedPage = localStorage.getItem(`currentPage_${id}`);

    setSettings(prev => ({
      ...prev,
      isDarkTheme: savedTheme === 'dark',
      fontSize: savedFontSize ? parseInt(savedFontSize) : prev.fontSize,
      lineHeight: savedLineHeight ? parseFloat(savedLineHeight) : prev.lineHeight,
      isPageMode: savedPageMode !== null ? savedPageMode === 'true' : prev.isPageMode
    }));

    // Restore bookmark and position
    if (savedBookmarks) {
      try {
        const bookmarks: Bookmarks = JSON.parse(savedBookmarks);
        if (bookmarks[id]) {
          setIsBookmarked(true);
          const bookmarkPage = bookmarks[id].page || 1;
          setCurrentPage(bookmarkPage);
          console.log('Bookmark found, restoring to page:', bookmarkPage);
        } else if (savedPage) {
          setCurrentPage(parseInt(savedPage));
        }
      } catch (error) {
        console.error('Error parsing bookmarks:', error);
      }
    } else if (savedPage) {
      setCurrentPage(parseInt(savedPage));
    }
  }, [id]);

  // Re-split content when settings change
  useEffect(() => {
    if (book && book.content) {
      splitContentIntoPages(book.content);
    }
  }, [settings.fontSize, settings.lineHeight, book]);

  // Restore reading progress and scroll position
  useEffect(() => {
    if (!id || totalPages === 0 || currentPage === 0 || !book) return;

    const timer = setTimeout(() => {
      const savedProgress = localStorage.getItem(`readingProgress_${id}`);
      if (savedProgress) {
        setReadingProgressValue(parseInt(savedProgress));
      }

      // Restore scroll position from bookmark
      const bookmarksStr = localStorage.getItem('bookmarks');
      if (bookmarksStr) {
        try {
          const bookmarks: Bookmarks = JSON.parse(bookmarksStr);
          if (bookmarks[id] && bookmarks[id].scrollPosition !== undefined) {
            const scrollPos = bookmarks[id].scrollPosition;
            console.log('Restoring scroll position:', scrollPos);
            window.scrollTo({ top: scrollPos, behavior: 'smooth' });
          }
        } catch (error) {
          console.error('Error restoring scroll position:', error);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [totalPages, id, book]);

  // Split content into pages
  const splitContentIntoPages = useCallback((content: string) => {
    let htmlContent: string;
    let cleanContent: string;

    try {
      htmlContent = marked(content, { breaks: true, gfm: true }) as string;
      cleanContent = DOMPurify.sanitize(htmlContent);
    } catch (error) {
      console.error('Error processing content:', error);
      cleanContent = content.replace(/\n/g, '<br>');
    }

    // Split into pages (approximately 800 words per page)
    const wordsPerPage = 800;
    const words = cleanContent.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(word => word.length > 0);
    const pageCount = Math.ceil(words.length / wordsPerPage);

    const newPages: string[] = [];
    for (let i = 0; i < pageCount; i++) {
      const startWord = i * wordsPerPage;
      const endWord = Math.min(startWord + wordsPerPage, words.length);
      const pageWords = words.slice(startWord, endWord);
      const pageContent = pageWords.join(' ');
      newPages.push(pageContent);
    }

    setPages(newPages);
    setTotalPages(pageCount);
  }, []);

  // Page navigation
  const nextPage = () => {
    if (!id || currentPage >= totalPages || isFlipping) return;

    setIsFlipping(true);
    setFlippingPageContent(pages[currentPage - 1] || '');
    setNextPageContent(pages[currentPage] || '');
    setPageTransition('flip-left');

    setTimeout(() => {
      setPageTransition('');
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      localStorage.setItem(`currentPage_${id}`, newPage.toString());
      updateProgress(newPage);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      setIsFlipping(false);
    }, 700);
  };

  const prevPage = () => {
    if (!id || currentPage <= 1 || isFlipping) return;

    setIsFlipping(true);
    setFlippingPageContent(pages[currentPage - 1] || '');
    setNextPageContent(pages[currentPage - 2] || '');
    setPageTransition('flip-right');

    setTimeout(() => {
      setPageTransition('');
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      localStorage.setItem(`currentPage_${id}`, newPage.toString());
      updateProgress(newPage);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      setIsFlipping(false);
    }, 700);
  };

  const updateProgress = async (page: number) => {
    if (!id) return;

    const progress = Math.round((page / totalPages) * 100);
    setReadingProgressValue(progress);
    localStorage.setItem(`readingProgress_${id}`, progress.toString());

    // Save to IndexedDB
    await saveProgress(id, progress, page, 0);
  };

  const goToPage = (pageNum: number) => {
    if (!id || pageNum < 1 || pageNum > totalPages) return;

    setCurrentPage(pageNum);
    localStorage.setItem(`currentPage_${id}`, pageNum.toString());
    updateProgress(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouch({ start: e.targetTouches[0].clientX, end: null });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouch(prev => ({ ...prev, end: e.targetTouches[0].clientX }));
  };

  const handleTouchEnd = () => {
    if (!touch.start || !touch.end) return;

    const distance = touch.start - touch.end;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentPage < totalPages) {
      nextPage();
    }
    if (isRightSwipe && currentPage > 1) {
      prevPage();
    }
  };

  // Pointer events for swipe navigation (desktop)
  useEffect(() => {
    let startX = 0;
    let endX = 0;

    const handlePointerDown = (e: PointerEvent) => {
      startX = e.clientX;
    };

    const handlePointerUp = (e: PointerEvent) => {
      endX = e.clientX;
      const diffX = startX - endX;

      if (Math.abs(diffX) > 50) {
        if (diffX > 0 && currentPage < totalPages) {
          nextPage();
        } else if (diffX < 0 && currentPage > 1) {
          prevPage();
        }
      }
    };

    const element = document.getElementById('book-reader-content');
    if (element && settings.isPageMode) {
      element.addEventListener('pointerdown', handlePointerDown);
      element.addEventListener('pointerup', handlePointerUp);

      return () => {
        element.removeEventListener('pointerdown', handlePointerDown);
        element.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [currentPage, totalPages, settings.isPageMode]);

  // Settings handlers
  const toggleTheme = () => {
    const newTheme = !settings.isDarkTheme;
    setSettings(prev => ({ ...prev, isDarkTheme: newTheme }));
    localStorage.setItem('readerTheme', newTheme ? 'dark' : 'light');
  };

  const changeFontSize = (newSize: number) => {
    setSettings(prev => ({ ...prev, fontSize: newSize }));
    localStorage.setItem('readerFontSize', newSize.toString());
  };

  const changeLineHeight = (newHeight: number) => {
    setSettings(prev => ({ ...prev, lineHeight: newHeight }));
    localStorage.setItem('readerLineHeight', newHeight.toString());
  };

  const togglePageMode = () => {
    const newMode = !settings.isPageMode;
    setSettings(prev => ({ ...prev, isPageMode: newMode }));
    localStorage.setItem('readerPageMode', newMode.toString());
  };

  const changeSpeechRate = (rate: number) => {
    setSettings(prev => ({ ...prev, speechRate: rate }));
  };

  // Bookmark handler
  const toggleBookmark = () => {
    if (!id) return;

    const bookmarksStr = localStorage.getItem('bookmarks');
    let bookmarks: Bookmarks = {};

    try {
      bookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : {};
    } catch (error) {
      console.error('Error parsing bookmarks:', error);
    }

    if (isBookmarked) {
      delete bookmarks[id];
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(false);
    } else {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      bookmarks[id] = {
        page: currentPage,
        progress: readingProgressValue,
        scrollPosition: scrollPosition,
        timestamp: Date.now()
      };
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(`Закладка сохранена на странице ${currentPage}`);
      }
    }
  };

  // Text-to-Speech
  const toggleSpeech = () => {
    if (!window.speechSynthesis) {
      alert('Функция озвучки не поддерживается в этом браузере');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const text = pages[currentPage - 1] || '';
      const cleanText = text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '');

      if (!cleanText.trim()) {
        alert('Нет текста для озвучки');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = settings.speechRate;
      utterance.lang = 'ru-RU';

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        console.error('Ошибка озвучки');
      };

      try {
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      } catch (error) {
        console.error('Error starting speech:', error);
        setIsPlaying(false);
      }
    }
  };

  // Offline handlers
  const toggleOfflineAccess = async () => {
    if (!book) return;

    if (isOfflineAvailable) {
      const success = await removeOfflineBook(String(book.id));
      if (success) {
        setIsOfflineAvailable(false);
      }
    } else {
      const offlineBook: Partial<OfflineBook> = {
        bookId: String(book.id),
        title: book.title,
        author: book.author || '',
        content: book.content,
        description: book.description,
        cover: book.cover,
        category: book.category,
        isPro: book.isPro
      };

      const success = await saveOfflineBook(offlineBook);
      if (success) {
        setIsOfflineAvailable(true);
      }
    }
  };

  // Share book
  const shareBook = async () => {
    if (!book) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: book.description || '',
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  // Send book to bot
  const sendBookToBot = async () => {
    if (!book) return;

    try {
      const botUsername = window.Telegram?.WebApp?.initDataUnsafe?.bot?.username || 'MubarakWayApp_bot';
      const deepLink = `https://t.me/${botUsername}?start=download_book_${book.id}`;

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showConfirm(
          `Отправить книгу "${book.title}" в чат с ботом?`,
          (confirmed) => {
            if (confirmed) {
              window.Telegram.WebApp.HapticFeedback?.impactOccurred('light');
              window.Telegram.WebApp.openLink(deepLink);
            }
          }
        );
      } else {
        window.open(deepLink, '_blank');
      }
    } catch (error) {
      console.error('Error sending book to bot:', error);
      alert('Ошибка при отправке книги в бот');
    }
  };

  // Render helpers
  const renderPageContent = (content: string): string => {
    try {
      return DOMPurify.sanitize(marked(content, { breaks: true, gfm: true }) as string);
    } catch (error) {
      console.error('Error rendering page content:', error);
      return content.replace(/\n/g, '<br>');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-green-600 animate-pulse" />
          <p className="text-xl text-gray-600">Загрузка книги...</p>
        </div>
      </div>
    );
  }

  // No book state
  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <p className="text-xl text-gray-600">Книга не найдена</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  const themeClasses = settings.isDarkTheme
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800';

  const mainStyle: React.CSSProperties = settings.isDarkTheme
    ? {
        background: 'linear-gradient(135deg, #1a1f2e 0%, #151820 100%)',
        minHeight: '100vh'
      }
    : {
        background: 'linear-gradient(135deg, #fdfbfb 0%, #f5f7fa 100%)',
        minHeight: '100vh'
      };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${themeClasses}`}
      style={mainStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 shadow-lg ${
        settings.isDarkTheme
          ? 'bg-gray-900/95 border-gray-700'
          : 'bg-white/95 border-gray-300'
      }`}>
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-xl transition-all duration-200 shrink-0 touch-manipulation ${
                settings.isDarkTheme
                  ? 'hover:bg-gray-800 active:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 active:bg-gray-200 text-gray-600'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="font-bold text-sm sm:text-lg truncate">
                  {book.title}
                </h1>
                {isGuideMode && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shrink-0">
                    Гид
                  </span>
                )}
              </div>
              {book.author && (
                <p className={`text-xs sm:text-sm truncate ${settings.isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  {book.author}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* Mobile essential controls */}
            <div className="flex items-center space-x-1 sm:hidden">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full transition-all duration-200 touch-manipulation ${
                  isBookmarked
                    ? 'text-yellow-500 bg-yellow-100 active:bg-yellow-200'
                    : settings.isDarkTheme
                      ? 'hover:bg-gray-700 active:bg-gray-600 text-gray-300'
                      : 'hover:bg-gray-100 active:bg-gray-200 text-gray-600'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-all duration-200 touch-manipulation ${
                  settings.isDarkTheme
                    ? 'hover:bg-gray-700 active:bg-gray-600 text-gray-300'
                    : 'hover:bg-gray-100 active:bg-gray-200 text-gray-600'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop full controls */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={toggleSpeech}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isPlaying
                    ? 'text-blue-500 bg-blue-100'
                    : settings.isDarkTheme
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button
                onClick={shareBook}
                className={`p-2 rounded-full transition-all duration-200 ${
                  settings.isDarkTheme
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={sendBookToBot}
                className={`p-2 rounded-full transition-all duration-200 ${
                  settings.isDarkTheme
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Отправить в бот"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={toggleOfflineAccess}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isOfflineAvailable
                    ? 'text-green-500 bg-green-100'
                    : settings.isDarkTheme
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={isOfflineAvailable ? 'Удалить из офлайн хранилища' : 'Сохранить для офлайн чтения'}
              >
                {isOfflineAvailable ? <HardDrive className="w-5 h-5" /> : <CloudDownload className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isBookmarked
                    ? 'text-yellow-500 bg-yellow-100'
                    : settings.isDarkTheme
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-all duration-200 touch-manipulation ${
                  settings.isDarkTheme
                    ? 'hover:bg-gray-700 active:bg-gray-600 text-gray-300'
                    : 'hover:bg-gray-100 active:bg-gray-200 text-gray-600'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className={`h-1 ${settings.isDarkTheme ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
            style={{ width: `${readingProgressValue}%` }}
          />
        </div>

        {/* Page Navigation */}
        {settings.isPageMode && (
          <div className="px-3 py-2 sm:px-4 sm:py-3">
            {/* Mobile navigation */}
            <div className="sm:hidden flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 px-3 py-2 rounded-lg">
                <span className="text-xs font-medium">Страница</span>
                <span className="text-sm font-bold">{currentPage}</span>
                <span className="text-xs text-gray-500">/</span>
                <span className="text-sm font-medium">{totalPages}</span>
              </div>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:flex items-center justify-between">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all transform hover:scale-105 ${
                  currentPage === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : settings.isDarkTheme
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 shadow-md'
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Назад</span>
              </button>

              <div className="flex items-center space-x-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 px-4 py-2 rounded-xl">
                <span className="text-sm font-medium">Страница</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value))}
                  className={`w-20 px-3 py-1 text-center rounded-lg font-medium transition-all ${
                    settings.isDarkTheme
                      ? 'bg-gray-800 border-gray-600 text-gray-200 focus:ring-2 focus:ring-green-500'
                      : 'bg-white border-gray-300 focus:ring-2 focus:ring-green-500'
                  }`}
                />
                <span className="text-sm font-medium">из {totalPages}</span>
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all transform hover:scale-105 ${
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : settings.isDarkTheme
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 shadow-md'
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md'
                }`}
              >
                <span className="text-sm font-medium">Вперед</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Settings panel */}
      {showSettings && (
        <>
          {/* Mobile overlay */}
          <div
            className="sm:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setShowSettings(false)}
          />

          {/* Settings panel */}
          <div className={`
            absolute z-40 backdrop-blur-lg border transition-all duration-300
            sm:top-20 sm:right-4 sm:rounded-2xl sm:w-80 sm:p-6
            max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:rounded-t-2xl max-sm:p-4 max-sm:max-h-[80vh] max-sm:overflow-y-auto
            shadow-2xl
            ${
              settings.isDarkTheme
                ? 'bg-gray-900/95 border-gray-700'
                : 'bg-white/95 border-gray-300'
            }
          `}>
            {/* Mobile close button */}
            <div className="sm:hidden flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg">Настройки</h3>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-lg ${
                  settings.isDarkTheme
                    ? 'hover:bg-gray-800 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6 sm:w-full">
              {/* Theme toggle */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Тема</span>
                <button
                  onClick={toggleTheme}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
                    settings.isDarkTheme
                      ? 'bg-gray-700 text-yellow-400'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {settings.isDarkTheme ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span>{settings.isDarkTheme ? 'Темная' : 'Светлая'}</span>
                </button>
              </div>

              {/* Page mode toggle */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Режим страниц</span>
                <button
                  onClick={togglePageMode}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    settings.isPageMode
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                      : settings.isDarkTheme
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {settings.isPageMode ? 'Включен' : 'Выключен'}
                </button>
              </div>

              {/* Font size */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">Размер шрифта</span>
                </div>
                <div className="grid grid-cols-3 sm:flex gap-2 sm:space-x-2">
                  {[14, 16, 18, 20, 22, 24].map(size => (
                    <button
                      key={size}
                      onClick={() => changeFontSize(size)}
                      className={`px-2 py-2 sm:px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                        settings.fontSize === size
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                          : settings.isDarkTheme
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line height */}
              <div className="space-y-3">
                <span className="font-medium text-sm sm:text-base">Межстрочный интервал</span>
                <div className="grid grid-cols-3 sm:flex gap-2 sm:space-x-2">
                  {[1.4, 1.6, 1.8, 2.0, 2.2].map(height => (
                    <button
                      key={height}
                      onClick={() => changeLineHeight(height)}
                      className={`px-2 py-2 sm:px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                        settings.lineHeight === height
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                          : settings.isDarkTheme
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {height}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speech rate */}
              <div className="space-y-3 sm:block hidden">
                <span className="font-medium text-sm sm:text-base">Скорость озвучки</span>
                <div className="grid grid-cols-3 sm:flex gap-2 sm:space-x-2">
                  {[0.5, 0.75, 1, 1.25, 1.5].map(rate => (
                    <button
                      key={rate}
                      onClick={() => changeSpeechRate(rate)}
                      className={`px-2 py-2 sm:px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                        settings.speechRate === rate
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                          : settings.isDarkTheme
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile actions row */}
              <div className="sm:hidden flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={toggleSpeech}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isPlaying
                      ? 'text-blue-500 bg-blue-100'
                      : settings.isDarkTheme
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>Озвучка</span>
                </button>

                <button
                  onClick={shareBook}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    settings.isDarkTheme
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Поделиться</span>
                </button>

                <button
                  onClick={sendBookToBot}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    settings.isDarkTheme
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать</span>
                </button>
              </div>

              {/* Reading progress */}
              <div className="text-center">
                <p className={`text-sm ${settings.isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  Прогресс чтения: {readingProgressValue}%
                </p>
                <p className={`text-xs ${settings.isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                  Страница {currentPage} из {totalPages}
                </p>
              </div>

              {/* Online/Offline status */}
              <div className="flex items-center justify-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs ${
                  isOnline
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}>
                  {isOnline ? 'Онлайн' : 'Офлайн'}
                </span>
              </div>

              {/* Offline availability */}
              <div className="flex items-center justify-center space-x-2">
                {isOfflineAvailable ? (
                  <HardDrive className="w-4 h-4 text-green-500" />
                ) : (
                  <CloudDownload className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-xs ${
                  isOfflineAvailable
                    ? 'text-green-500'
                    : settings.isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {isOfflineAvailable ? 'Доступно офлайн' : 'Только онлайн'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <main
        id="book-reader-content"
        className="max-w-4xl mx-auto px-3 py-4 sm:px-6 sm:py-8 touch-pan-y"
        style={{
          touchAction: 'pan-y',
          minHeight: 'calc(100vh - 200px)',
          perspective: '2500px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        {/* Book Container with page stack effect */}
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>

          {/* Page Stack Layers */}
          <div
            className={`absolute inset-0 rounded-xl sm:rounded-2xl ${
              settings.isDarkTheme ? 'bg-gray-900' : 'bg-amber-100'
            }`}
            style={{
              minHeight: '500px',
              transform: 'translateZ(-15px) translateY(6px)',
              opacity: 0.5,
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
            }}
          />
          <div
            className={`absolute inset-0 rounded-xl sm:rounded-2xl ${
              settings.isDarkTheme ? 'bg-gray-850' : 'bg-amber-75'
            }`}
            style={{
              minHeight: '500px',
              transform: 'translateZ(-10px) translateY(4px)',
              opacity: 0.7,
              boxShadow: '0 6px 15px rgba(0,0,0,0.25)'
            }}
          />

          {/* Bottom/Next Page - visible underneath */}
          <div
            className={`absolute inset-0 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden ${
              settings.isDarkTheme
                ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                : 'bg-gradient-to-br from-amber-50 via-white to-amber-50'
            }`}
            style={{
              minHeight: '500px',
              transform: 'translateZ(-5px) translateY(2px)',
              boxShadow: settings.isDarkTheme
                ? 'inset 5px 0 15px rgba(0,0,0,0.5), inset -5px 0 15px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4)'
                : 'inset 5px 0 15px rgba(139,92,46,0.15), inset -5px 0 15px rgba(139,92,46,0.15), 0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            {/* Page edges effect */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 via-black/10 to-transparent"></div>
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/20 via-black/10 to-transparent"></div>

            {/* Next/Prev page content during animation */}
            {pageTransition && nextPageContent && (
              <div
                className={`p-6 sm:p-12 prose prose-sm sm:prose-lg max-w-none ${
                  settings.isDarkTheme
                    ? 'prose-invert prose-p:text-gray-300 prose-headings:text-gray-100'
                    : 'prose-p:text-gray-800 prose-headings:text-gray-900'
                }`}
                style={{
                  fontSize: `${Math.max(settings.fontSize - 2, 14)}px`,
                  lineHeight: settings.lineHeight,
                  fontFamily: settings.isDarkTheme
                    ? '"Inter", "Segoe UI", "Roboto", sans-serif'
                    : '"Crimson Text", "Georgia", "Times New Roman", serif',
                  textAlign: 'justify',
                  hyphens: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: renderPageContent(nextPageContent) }}
              />
            )}
          </div>

          {/* Top/Current Page - flips during animation */}
          {pageTransition && (
          <div
            className={`relative transition-all ease-in-out duration-[700ms]`}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: pageTransition === 'flip-left' ? '0% 50%' : '100% 50%',
              transform:
                pageTransition === 'flip-left' ? 'rotateY(-180deg) scale(0.95)' :
                pageTransition === 'flip-right' ? 'rotateY(180deg) scale(0.95)' :
                'rotateY(0deg) scale(1)',
              opacity: 0,
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            <div
              className={`rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative ${
                settings.isDarkTheme
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                  : 'bg-gradient-to-br from-amber-50 via-white to-amber-50'
              }`}
              style={{
                minHeight: '500px',
                backfaceVisibility: 'hidden',
                boxShadow: settings.isDarkTheme
                  ? '0 25px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 25px 70px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              {/* Enhanced page edges */}
              <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/15 to-transparent"></div>
                <div className="absolute left-1 top-0 bottom-0 w-px bg-black/20"></div>
                <div className="absolute left-2 top-0 bottom-0 w-px bg-black/15"></div>
                <div className="absolute left-3 top-0 bottom-0 w-px bg-black/10"></div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-black/15 to-transparent"></div>
                <div className="absolute right-1 top-0 bottom-0 w-px bg-black/20"></div>
                <div className="absolute right-2 top-0 bottom-0 w-px bg-black/15"></div>
                <div className="absolute right-3 top-0 bottom-0 w-px bg-black/10"></div>
              </div>

              {/* Page number */}
              {settings.isPageMode && (
                <div className={`absolute bottom-6 right-8 text-sm font-serif ${
                  settings.isDarkTheme ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {currentPage}
                </div>
              )}

              {/* Flipping page content */}
              <div
                className={`p-6 sm:p-12 prose prose-sm sm:prose-lg max-w-none ${
                  settings.isDarkTheme
                    ? 'prose-invert prose-p:text-gray-300 prose-headings:text-gray-100'
                    : 'prose-p:text-gray-800 prose-headings:text-gray-900'
                }`}
                style={{
                  fontSize: `${Math.max(settings.fontSize - 2, 14)}px`,
                  lineHeight: settings.lineHeight,
                  fontFamily: settings.isDarkTheme
                    ? '"Inter", "Segoe UI", "Roboto", sans-serif'
                    : '"Crimson Text", "Georgia", "Times New Roman", serif',
                  textAlign: 'justify',
                  hyphens: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: renderPageContent(flippingPageContent || '') }}
              />
            </div>
          </div>
          )}

          {/* Static Current Page - visible when no animation */}
          {!pageTransition && (
          <div className="relative">
            <div
              className={`rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative ${
                settings.isDarkTheme
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                  : 'bg-gradient-to-br from-amber-50 via-white to-amber-50'
              }`}
              style={{
                minHeight: '500px',
                backfaceVisibility: 'hidden',
                boxShadow: settings.isDarkTheme
                  ? '0 25px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 25px 70px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              {/* Enhanced page edges */}
              <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/15 to-transparent"></div>
                <div className="absolute left-1 top-0 bottom-0 w-px bg-black/20"></div>
                <div className="absolute left-2 top-0 bottom-0 w-px bg-black/15"></div>
                <div className="absolute left-3 top-0 bottom-0 w-px bg-black/10"></div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-black/15 to-transparent"></div>
                <div className="absolute right-1 top-0 bottom-0 w-px bg-black/20"></div>
                <div className="absolute right-2 top-0 bottom-0 w-px bg-black/15"></div>
                <div className="absolute right-3 top-0 bottom-0 w-px bg-black/10"></div>
              </div>

              {/* Page number */}
              {settings.isPageMode && (
                <div className={`absolute bottom-6 right-8 text-sm font-serif ${
                  settings.isDarkTheme ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {currentPage}
                </div>
              )}

              {/* Content */}
              <div
                className={`p-6 sm:p-12 prose prose-sm sm:prose-lg max-w-none ${
                  settings.isDarkTheme
                    ? 'prose-invert prose-p:text-gray-300 prose-headings:text-gray-100'
                    : 'prose-p:text-gray-800 prose-headings:text-gray-900'
                }`}
                style={{
                  fontSize: `${Math.max(settings.fontSize - 2, 14)}px`,
                  lineHeight: settings.lineHeight,
                  fontFamily: settings.isDarkTheme
                    ? '"Inter", "Segoe UI", "Roboto", sans-serif'
                    : '"Crimson Text", "Georgia", "Times New Roman", serif',
                  textAlign: 'justify',
                  hyphens: 'auto'
                }}
              >
                {settings.isPageMode ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: renderPageContent(pages[currentPage - 1] || '') }}
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: renderPageContent(book.content) }}
                  />
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </main>

      {/* Floating controls */}
      <div className={`fixed bottom-20 right-3 sm:bottom-6 sm:right-6 flex flex-col space-y-2 z-40`}>
        {/* Reading progress indicator */}
        <div className={`p-2 sm:p-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 ${
          settings.isDarkTheme
            ? 'bg-gray-900/95 border border-gray-700'
            : 'bg-white/95 border border-gray-300'
        }`}>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">{readingProgressValue}%</span>
          </div>
        </div>

        {/* Reset reading position */}
        <button
          onClick={() => goToPage(1)}
          className={`p-2 sm:p-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 ${
            settings.isDarkTheme
              ? 'bg-gray-900/95 border border-gray-700 hover:bg-gray-800'
              : 'bg-white/95 border border-gray-300 hover:bg-gray-100'
          }`}
          title="Начать сначала"
        >
          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Mobile swipe indicator */}
      <div className="sm:hidden fixed bottom-28 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
        <div className={`flex items-center space-x-4 px-4 py-2 rounded-full text-xs backdrop-blur-sm transition-all duration-300 ${
          settings.isDarkTheme
            ? 'bg-gray-900/90 text-gray-200 border border-gray-600'
            : 'bg-white/90 text-gray-700 border border-gray-300 shadow-lg'
        }`}>
          <div className={`flex items-center space-x-1 transition-opacity ${
            currentPage > 1 ? 'opacity-100' : 'opacity-30'
          }`}>
            <ChevronLeft className="w-4 h-4" />
            <span>Свайп</span>
          </div>
          <div className="w-px h-4 bg-gray-400" />
          <div className={`flex items-center space-x-1 transition-opacity ${
            currentPage < totalPages ? 'opacity-100' : 'opacity-30'
          }`}>
            <span>Свайп</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookReader;

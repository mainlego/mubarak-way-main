import { useState, useEffect, useCallback } from 'react';
import {
  offlineBooks,
  offlineNashids,
  readingProgress,
  storageManager,
  networkStatus,
  type OfflineBook,
  type OfflineNashid,
  type ReadingProgress,
  type StorageSize,
  type StorageStats
} from '../lib/offlineStorage';

/**
 * Hook for managing offline books
 */
export const useOfflineBooks = () => {
  const [books, setBooks] = useState<OfflineBook[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    const allBooks = await offlineBooks.getAllBooks();
    setBooks(allBooks);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const saveBook = useCallback(async (book: Partial<OfflineBook>) => {
    const success = await offlineBooks.saveBook(book);
    if (success) {
      await loadBooks();
    }
    return success;
  }, [loadBooks]);

  const removeBook = useCallback(async (bookId: string) => {
    const success = await offlineBooks.removeBook(bookId);
    if (success) {
      await loadBooks();
    }
    return success;
  }, [loadBooks]);

  const isBookOffline = useCallback(async (bookId: string) => {
    return await offlineBooks.isBookOffline(bookId);
  }, []);

  return {
    books,
    loading,
    saveBook,
    removeBook,
    isBookOffline,
    reload: loadBooks
  };
};

/**
 * Hook for managing offline nashids
 */
export const useOfflineNashids = () => {
  const [nashids, setNashids] = useState<OfflineNashid[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNashids = useCallback(async () => {
    setLoading(true);
    const allNashids = await offlineNashids.getAllNashids();
    setNashids(allNashids);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNashids();
  }, [loadNashids]);

  const saveNashid = useCallback(async (nashid: Partial<OfflineNashid>, audioBlob?: Blob) => {
    const success = await offlineNashids.saveNashid(nashid, audioBlob);
    if (success) {
      await loadNashids();
    }
    return success;
  }, [loadNashids]);

  const removeNashid = useCallback(async (nashidId: string) => {
    const success = await offlineNashids.removeNashid(nashidId);
    if (success) {
      await loadNashids();
    }
    return success;
  }, [loadNashids]);

  const isNashidOffline = useCallback(async (nashidId: string) => {
    return await offlineNashids.isNashidOffline(nashidId);
  }, []);

  return {
    nashids,
    loading,
    saveNashid,
    removeNashid,
    isNashidOffline,
    reload: loadNashids
  };
};

/**
 * Hook for managing reading progress
 */
export const useReadingProgress = (bookId?: string) => {
  const [progress, setProgress] = useState<ReadingProgress | undefined>();
  const [loading, setLoading] = useState(false);

  const loadProgress = useCallback(async (id: string) => {
    setLoading(true);
    const progressData = await readingProgress.getProgress(id);
    setProgress(progressData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (bookId) {
      loadProgress(bookId);
    }
  }, [bookId, loadProgress]);

  const saveProgress = useCallback(async (
    id: string,
    progressValue: number,
    currentPage?: number,
    lastPosition?: number
  ) => {
    const success = await readingProgress.saveProgress(
      id,
      progressValue,
      currentPage,
      lastPosition
    );
    if (success && bookId === id) {
      await loadProgress(id);
    }
    return success;
  }, [bookId, loadProgress]);

  return {
    progress,
    loading,
    saveProgress,
    reload: bookId ? () => loadProgress(bookId) : undefined
  };
};

/**
 * Hook for monitoring network status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(networkStatus.isOnline());

  useEffect(() => {
    const cleanup = networkStatus.addNetworkListener((online) => {
      setIsOnline(online);
    });

    return cleanup;
  }, []);

  return { isOnline, isOffline: !isOnline };
};

/**
 * Hook for managing storage
 */
export const useStorage = () => {
  const [storageSize, setStorageSize] = useState<StorageSize | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStorageInfo = useCallback(async () => {
    setLoading(true);
    const [size, stats] = await Promise.all([
      storageManager.getStorageSize(),
      storageManager.getStorageStats()
    ]);
    setStorageSize(size);
    setStorageStats(stats);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStorageInfo();
  }, [loadStorageInfo]);

  const clearAllData = useCallback(async () => {
    const success = await storageManager.clearAllOfflineData();
    if (success) {
      await loadStorageInfo();
    }
    return success;
  }, [loadStorageInfo]);

  return {
    storageSize,
    storageStats,
    loading,
    clearAllData,
    reload: loadStorageInfo
  };
};

/**
 * Hook for combined offline functionality
 */
export const useOffline = () => {
  const { isOnline, isOffline } = useNetworkStatus();
  const { storageSize, storageStats } = useStorage();

  return {
    isOnline,
    isOffline,
    storageSize,
    storageStats
  };
};

import Dexie, { type Table } from 'dexie';

// Types
export interface OfflineBook {
  id?: number;
  bookId: string;
  title: string;
  author: string;
  content: string;
  description?: string;
  cover?: string;
  category?: string;
  isPro?: boolean;
  downloadedAt: Date;
  lastRead: Date;
}

export interface OfflineNashid {
  id?: number;
  nashidId: string;
  title: string;
  artist: string;
  audioBlob?: Blob;
  audioUrl?: string;
  duration?: number;
  category?: string;
  downloadedAt: Date;
  lastPlayed: Date;
}

export interface ReadingProgress {
  id?: number;
  bookId: string;
  progress: number;
  currentPage: number;
  lastPosition: number;
  updatedAt: Date;
}

export interface PrayerTimesData {
  id?: number;
  date: string;
  location: string;
  times: string;
  calculationMethod: string;
  updatedAt: Date;
}

export interface UserSetting {
  id?: number;
  setting: string;
  value: string;
  updatedAt: Date;
}

export interface OfflineContentData {
  id?: number;
  type: string;
  content: string;
  metadata: string;
  downloadedAt: Date;
  expiresAt: Date;
}

export interface StorageSize {
  used: number;
  available: number;
  percentage: number;
}

export interface StorageStats {
  books: number;
  nashids: number;
  readingProgress: number;
  prayerTimes: number;
  offlineContent: number;
  total: number;
}

// Database schema
class MubarakWayDB extends Dexie {
  books!: Table<OfflineBook>;
  nashids!: Table<OfflineNashid>;
  readingProgress!: Table<ReadingProgress>;
  prayerTimes!: Table<PrayerTimesData>;
  userSettings!: Table<UserSetting>;
  offlineContent!: Table<OfflineContentData>;

  constructor() {
    super('MubarakWayDB');

    this.version(1).stores({
      books: '++id, bookId, title, author, category, isPro, downloadedAt, lastRead',
      nashids: '++id, nashidId, title, artist, category, downloadedAt, lastPlayed',
      readingProgress: '++id, bookId, progress, currentPage, lastPosition, updatedAt',
      prayerTimes: '++id, date, location, calculationMethod, updatedAt',
      userSettings: '++id, setting, updatedAt',
      offlineContent: '++id, type, expiresAt, downloadedAt'
    });
  }
}

const db = new MubarakWayDB();

// Books offline storage
export const offlineBooks = {
  // Сохранить книгу для офлайн чтения
  async saveBook(book: Partial<OfflineBook>): Promise<boolean> {
    try {
      const offlineBook: OfflineBook = {
        ...book as OfflineBook,
        downloadedAt: new Date(),
        lastRead: new Date()
      };
      await db.books.put(offlineBook);
      return true;
    } catch (error) {
      console.error('Error saving book offline:', error);
      return false;
    }
  },

  // Получить все офлайн книги
  async getAllBooks(): Promise<OfflineBook[]> {
    try {
      return await db.books.orderBy('lastRead').reverse().toArray();
    } catch (error) {
      console.error('Error getting offline books:', error);
      return [];
    }
  },

  // Получить конкретную книгу
  async getBook(bookId: string): Promise<OfflineBook | undefined> {
    try {
      return await db.books.where('bookId').equals(bookId).first();
    } catch (error) {
      console.error('Error getting offline book:', error);
      return undefined;
    }
  },

  // Удалить книгу из офлайн хранилища
  async removeBook(bookId: string): Promise<boolean> {
    try {
      await db.books.where('bookId').equals(bookId).delete();
      return true;
    } catch (error) {
      console.error('Error removing offline book:', error);
      return false;
    }
  },

  // Проверить, есть ли книга в офлайн хранилище
  async isBookOffline(bookId: string): Promise<boolean> {
    try {
      const book = await db.books.where('bookId').equals(bookId).first();
      return !!book;
    } catch (error) {
      return false;
    }
  },

  // Обновить время последнего чтения
  async updateLastRead(bookId: string): Promise<void> {
    try {
      const book = await db.books.where('bookId').equals(bookId).first();
      if (book && book.id) {
        await db.books.update(book.id, { lastRead: new Date() });
      }
    } catch (error) {
      console.error('Error updating last read:', error);
    }
  }
};

// Nashids offline storage
export const offlineNashids = {
  // Сохранить нашид для офлайн прослушивания
  async saveNashid(nashid: Partial<OfflineNashid>, audioBlob?: Blob): Promise<boolean> {
    try {
      const offlineNashid: OfflineNashid = {
        ...nashid as OfflineNashid,
        audioBlob: audioBlob,
        downloadedAt: new Date(),
        lastPlayed: new Date()
      };
      await db.nashids.put(offlineNashid);
      return true;
    } catch (error) {
      console.error('Error saving nashid offline:', error);
      return false;
    }
  },

  // Получить все офлайн нашиды
  async getAllNashids(): Promise<OfflineNashid[]> {
    try {
      return await db.nashids.orderBy('lastPlayed').reverse().toArray();
    } catch (error) {
      console.error('Error getting offline nashids:', error);
      return [];
    }
  },

  // Получить конкретный нашид
  async getNashid(nashidId: string): Promise<OfflineNashid | undefined> {
    try {
      return await db.nashids.where('nashidId').equals(nashidId).first();
    } catch (error) {
      console.error('Error getting offline nashid:', error);
      return undefined;
    }
  },

  // Удалить нашид из офлайн хранилища
  async removeNashid(nashidId: string): Promise<boolean> {
    try {
      await db.nashids.where('nashidId').equals(nashidId).delete();
      return true;
    } catch (error) {
      console.error('Error removing offline nashid:', error);
      return false;
    }
  },

  // Проверить, есть ли нашид в офлайн хранилище
  async isNashidOffline(nashidId: string): Promise<boolean> {
    try {
      const nashid = await db.nashids.where('nashidId').equals(nashidId).first();
      return !!nashid;
    } catch (error) {
      return false;
    }
  }
};

// Reading progress storage
export const readingProgress = {
  // Сохранить прогресс чтения
  async saveProgress(
    bookId: string,
    progress: number,
    currentPage: number = 1,
    lastPosition: number = 0
  ): Promise<boolean> {
    try {
      const existing = await db.readingProgress.where('bookId').equals(bookId).first();

      const progressData: ReadingProgress = {
        id: existing?.id,
        bookId,
        progress,
        currentPage,
        lastPosition,
        updatedAt: new Date()
      };

      await db.readingProgress.put(progressData);
      return true;
    } catch (error) {
      console.error('Error saving reading progress:', error);
      return false;
    }
  },

  // Получить прогресс чтения книги
  async getProgress(bookId: string): Promise<ReadingProgress | undefined> {
    try {
      return await db.readingProgress.where('bookId').equals(bookId).first();
    } catch (error) {
      console.error('Error getting reading progress:', error);
      return undefined;
    }
  },

  // Получить весь прогресс чтения
  async getAllProgress(): Promise<ReadingProgress[]> {
    try {
      return await db.readingProgress.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      console.error('Error getting all reading progress:', error);
      return [];
    }
  }
};

// Prayer times offline storage
export const offlinePrayerTimes = {
  // Сохранить время молитв
  async savePrayerTimes(
    date: Date,
    location: any,
    times: any,
    calculationMethod: string
  ): Promise<boolean> {
    try {
      const existing = await db.prayerTimes.where('date').equals(date.toDateString()).first();

      const prayerData: PrayerTimesData = {
        id: existing?.id,
        date: date.toDateString(),
        location: JSON.stringify(location),
        times: JSON.stringify(times),
        calculationMethod,
        updatedAt: new Date()
      };

      await db.prayerTimes.put(prayerData);
      return true;
    } catch (error) {
      console.error('Error saving prayer times:', error);
      return false;
    }
  },

  // Получить время молитв за дату
  async getPrayerTimes(date: Date): Promise<any> {
    try {
      const result = await db.prayerTimes.where('date').equals(date.toDateString()).first();
      if (result) {
        return {
          ...result,
          location: JSON.parse(result.location),
          times: JSON.parse(result.times)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting prayer times:', error);
      return null;
    }
  }
};

// User settings storage
export const userSettings = {
  // Сохранить настройку
  async saveSetting(setting: string, value: any): Promise<boolean> {
    try {
      const existing = await db.userSettings.where('setting').equals(setting).first();

      const settingData: UserSetting = {
        id: existing?.id,
        setting,
        value: JSON.stringify(value),
        updatedAt: new Date()
      };

      await db.userSettings.put(settingData);
      return true;
    } catch (error) {
      console.error('Error saving setting:', error);
      return false;
    }
  },

  // Получить настройку
  async getSetting(setting: string): Promise<any> {
    try {
      const result = await db.userSettings.where('setting').equals(setting).first();
      if (result) {
        return JSON.parse(result.value);
      }
      return null;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  },

  // Получить все настройки
  async getAllSettings(): Promise<Record<string, any>> {
    try {
      const results = await db.userSettings.toArray();
      const settings: Record<string, any> = {};
      results.forEach(item => {
        settings[item.setting] = JSON.parse(item.value);
      });
      return settings;
    } catch (error) {
      console.error('Error getting all settings:', error);
      return {};
    }
  }
};

// General offline content storage
export const offlineContent = {
  // Сохранить произвольный контент
  async saveContent(
    type: string,
    content: any,
    metadata: any = {},
    expirationHours: number = 24
  ): Promise<boolean> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);

      const existing = await db.offlineContent.where('type').equals(type).first();

      const contentData: OfflineContentData = {
        id: existing?.id,
        type,
        content: JSON.stringify(content),
        metadata: JSON.stringify(metadata),
        downloadedAt: new Date(),
        expiresAt
      };

      await db.offlineContent.put(contentData);
      return true;
    } catch (error) {
      console.error('Error saving offline content:', error);
      return false;
    }
  },

  // Получить контент по типу
  async getContent(type: string): Promise<any> {
    try {
      const result = await db.offlineContent.where('type').equals(type).first();
      if (result && result.expiresAt > new Date()) {
        return {
          content: JSON.parse(result.content),
          metadata: JSON.parse(result.metadata),
          downloadedAt: result.downloadedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting offline content:', error);
      return null;
    }
  },

  // Очистить устаревший контент
  async cleanupExpiredContent(): Promise<boolean> {
    try {
      const now = new Date();
      await db.offlineContent.where('expiresAt').below(now).delete();
      return true;
    } catch (error) {
      console.error('Error cleaning up expired content:', error);
      return false;
    }
  }
};

// Storage management
export const storageManager = {
  // Получить размер используемого хранилища
  async getStorageSize(): Promise<StorageSize | null> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0,
          percentage: Math.round(((estimate.usage || 0) / (estimate.quota || 1)) * 100)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting storage size:', error);
      return null;
    }
  },

  // Очистить все офлайн данные
  async clearAllOfflineData(): Promise<boolean> {
    try {
      await db.books.clear();
      await db.nashids.clear();
      await db.readingProgress.clear();
      await db.prayerTimes.clear();
      await db.offlineContent.clear();
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  },

  // Получить статистику хранилища
  async getStorageStats(): Promise<StorageStats | null> {
    try {
      const [books, nashids, progress, prayers, content] = await Promise.all([
        db.books.count(),
        db.nashids.count(),
        db.readingProgress.count(),
        db.prayerTimes.count(),
        db.offlineContent.count()
      ]);

      return {
        books,
        nashids,
        readingProgress: progress,
        prayerTimes: prayers,
        offlineContent: content,
        total: books + nashids + progress + prayers + content
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }
};

// Network status checker
export const networkStatus = {
  // Проверить онлайн статус
  isOnline(): boolean {
    return navigator.onLine;
  },

  // Добавить слушатель изменения сетевого статуса
  addNetworkListener(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Возвращаем функцию для удаления слушателей
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};

export default db;

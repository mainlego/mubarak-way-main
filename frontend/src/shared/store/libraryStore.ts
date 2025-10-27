import { create } from 'zustand';
import type { Book, Nashid } from '@mubarak-way/shared';
import { libraryService } from '../lib/services';

interface LibraryState {
  books: Book[];
  currentBook: Book | null;
  nashids: Nashid[];
  currentNashid: Nashid | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBooks: (filters?: any) => Promise<void>;
  loadBook: (bookId: number) => Promise<void>;
  searchBooks: (query: string) => Promise<Book[]>;
  loadNashids: (filters?: any) => Promise<void>;
  loadNashid: (nashidId: number) => Promise<void>;
  searchNashids: (query: string) => Promise<Nashid[]>;
  clearCurrentBook: () => void;
  clearCurrentNashid: () => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  books: [],
  currentBook: null,
  nashids: [],
  currentNashid: null,
  isLoading: false,
  error: null,

  loadBooks: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await libraryService.getBooks(filters);
      set({ books: result.items, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadBook: async (bookId) => {
    set({ isLoading: true, error: null });
    try {
      const book = await libraryService.getBook(bookId);
      set({ currentBook: book, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  searchBooks: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const result = await libraryService.getBooks({ query });
      set({ books: result.items, isLoading: false });
      return result.items;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadNashids: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await libraryService.getNashids(filters);
      set({ nashids: result.items, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadNashid: async (nashidId) => {
    set({ isLoading: true, error: null });
    try {
      const nashid = await libraryService.getNashid(nashidId);
      set({ currentNashid: nashid, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  searchNashids: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const result = await libraryService.getNashids({ query });
      set({ nashids: result.items, isLoading: false });
      return result.items;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearCurrentBook: () => set({ currentBook: null }),
  clearCurrentNashid: () => set({ currentNashid: null }),
}));

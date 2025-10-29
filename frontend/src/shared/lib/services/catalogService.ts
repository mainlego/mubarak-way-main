/**
 * Catalog Service - Nasheeds, Books, Lessons from E-Replika API
 */

import { eReplikaGet } from '../eReplikaApi';
import type { CatalogCategory, CatalogItem, CatalogItemsResponse, Ayah } from '@/shared/types/eReplika';

export const catalogService = {
  /**
   * Get all catalog categories
   */
  getCategories: async (lang: string = 'ru'): Promise<CatalogCategory[]> => {
    return await eReplikaGet<CatalogCategory[]>('/catalog/categories', { lang });
  },

  /**
   * Get catalog items with filtering
   */
  getItems: async (params?: {
    category?: string;
    q?: string; // search query
    lang?: string;
    limit?: number;
    offset?: number;
    sort?: string;
  }): Promise<CatalogItemsResponse> => {
    return await eReplikaGet<CatalogItemsResponse>('/catalog/items', {
      lang: 'ru',
      limit: 20,
      offset: 0,
      ...params,
    });
  },

  /**
   * Get single catalog item
   */
  getItem: async (itemId: string, lang: string = 'ru'): Promise<CatalogItem> => {
    return await eReplikaGet<CatalogItem>(`/catalog/items/${itemId}`, { lang });
  },

  /**
   * Get ayahs for catalog item (for items with Quran references)
   */
  getItemAyahs: async (itemId: string, lang: string = 'ru'): Promise<Ayah[]> => {
    return await eReplikaGet<Ayah[]>(`/catalog/items/${itemId}/ayahs`, { lang });
  },

  /**
   * Get nasheeds from catalog
   */
  getNasheeds: async (params?: {
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<CatalogItemsResponse> => {
    return catalogService.getItems({
      category: 'nasheed',
      ...params,
    });
  },

  /**
   * Get books from catalog
   */
  getBooks: async (params?: {
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<CatalogItemsResponse> => {
    return catalogService.getItems({
      category: 'book',
      ...params,
    });
  },
};

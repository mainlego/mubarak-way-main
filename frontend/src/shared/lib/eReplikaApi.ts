/**
 * E-Replika API Client
 * Integration with https://bot.e-replika.ru/docs
 */

import axios, { type AxiosInstance } from 'axios';
import { getTelegramInitData } from './telegram';

const E_REPLIKA_BASE_URL = import.meta.env.VITE_QURAN_API_URL || 'https://bot.e-replika.ru/api/v1';

/**
 * Create axios instance for E-Replika API
 */
const eReplikaApi: AxiosInstance = axios.create({
  baseURL: E_REPLIKA_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add auth token
 */
eReplikaApi.interceptors.request.use(
  async (config) => {
    // First try to get test token if we don't have a real one
    try {
      const initData = getTelegramInitData();

      if (!config.headers['Authorization']) {
        // Get test token for development
        const tokenResponse = await axios.post(
          `${E_REPLIKA_BASE_URL}/auth/test-token`,
          {},
          { timeout: 10000 }
        );

        if (tokenResponse.data?.token) {
          config.headers['Authorization'] = `Bearer ${tokenResponse.data.token}`;
        }
      }

      // Add Telegram initData if available
      if (initData) {
        config.headers['X-Telegram-InitData'] = initData;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 */
eReplikaApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`E-Replika API error ${status}:`, data);
    } else if (error.request) {
      console.error('E-Replika network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default eReplikaApi;

/**
 * Generic request helper
 */
export async function eReplikaRequest<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  params?: any
): Promise<T> {
  const response = await eReplikaApi.request<T>({
    method,
    url,
    data,
    params,
  });

  return response.data;
}

/**
 * Convenience methods
 */
export const eReplikaGet = <T>(url: string, params?: any) =>
  eReplikaRequest<T>('get', url, undefined, params);

export const eReplikaPost = <T>(url: string, data?: any) =>
  eReplikaRequest<T>('post', url, data);

export const eReplikaPut = <T>(url: string, data?: any) =>
  eReplikaRequest<T>('put', url, data);

export const eReplikaDelete = <T>(url: string) =>
  eReplikaRequest<T>('delete', url);

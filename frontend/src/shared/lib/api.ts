import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { getTelegramInitData } from './telegram';
import type { ApiResponse } from '@mubarak-way/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

/**
 * Create axios instance with default config
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased from 30s to 60s for Render free tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add Telegram auth header
 */
api.interceptors.request.use(
  (config) => {
    // Add Telegram initData to headers
    const initData = getTelegramInitData();
    if (initData) {
      config.headers['X-Telegram-InitData'] = initData;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response;

      // Network or server errors
      if (status >= 500) {
        console.error('Server error:', data);
      }

      // Authentication errors
      if (status === 401) {
        console.error('Unauthorized:', data);
        // TODO: Redirect to login or show auth modal
      }

      // Rate limiting
      if (status === 429) {
        console.error('Rate limit exceeded:', data);
        // TODO: Show rate limit message to user
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

/**
 * Generic API request function with type safety
 */
export async function apiRequest<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  params?: any
): Promise<T> {
  try {
    const response = await api.request<ApiResponse<T>>({
      method,
      url,
      data,
      params,
    });

    if (response.data.success) {
      return response.data.data as T;
    } else {
      throw new Error(response.data.error?.message || 'API request failed');
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.error?.message || 'API error');
    }
    throw error;
  }
}

/**
 * Convenience methods
 */
export const apiGet = <T>(url: string, params?: any) =>
  apiRequest<T>('get', url, undefined, params);

export const apiPost = <T>(url: string, data?: any) =>
  apiRequest<T>('post', url, data);

export const apiPut = <T>(url: string, data?: any) =>
  apiRequest<T>('put', url, data);

export const apiDelete = <T>(url: string) =>
  apiRequest<T>('delete', url);

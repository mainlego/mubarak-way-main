/**
 * Version Service
 * Handles version checking and auto-update notifications
 */

import axios from 'axios';
import { getApiUrl } from './apiConfig';

export interface VersionInfo {
  version: string;
  timestamp: string;
  environment: string;
  changes?: string[];
}

export interface VersionCheckResult {
  currentVersion: string;
  clientVersion: string;
  needsUpdate: boolean;
  updateAvailable: boolean;
  changes: string[];
}

/**
 * Get current API version
 */
export async function getCurrentVersion(): Promise<VersionInfo> {
  try {
    const response = await axios.get(`${getApiUrl()}/api/v1/version`);
    return response.data;
  } catch (error) {
    console.error('Error fetching version:', error);
    throw error;
  }
}

/**
 * Check if update is available
 */
export async function checkForUpdate(clientVersion: string): Promise<VersionCheckResult> {
  try {
    const response = await axios.get(`${getApiUrl()}/api/v1/version/check`, {
      params: { version: clientVersion }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking for update:', error);
    throw error;
  }
}

/**
 * Compare two semantic versions
 * Returns: true if v1 > v2
 */
export function isNewerVersion(v1: string, v2: string): boolean {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return true;
    if (num1 < num2) return false;
  }

  return false;
}

export default {
  getCurrentVersion,
  checkForUpdate,
  isNewerVersion,
};

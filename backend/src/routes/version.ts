/**
 * Version Routes
 * Provides version information for auto-update functionality
 */

import express, { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = express.Router();

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
);
const version = packageJson.version || '1.0.0';

/**
 * GET /api/v1/version
 * Get current API version information
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    version: version,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * GET /api/v1/version/check
 * Check if client version is up to date
 */
router.get('/check', (req: Request, res: Response) => {
  const clientVersion = req.query.version as string;

  if (!clientVersion) {
    return res.status(400).json({
      success: false,
      error: 'Client version is required'
    });
  }

  const needsUpdate = compareVersions(version, clientVersion) > 0;

  res.json({
    success: true,
    currentVersion: version,
    clientVersion: clientVersion,
    needsUpdate,
    updateAvailable: needsUpdate,
    changes: needsUpdate ? getChangeLog(clientVersion) : [],
  });
});

/**
 * Compare two semantic versions
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

/**
 * Get changelog for versions after the client version
 */
function getChangeLog(fromVersion: string): string[] {
  // This would ideally come from a database or changelog file
  // For now, return a static list based on current version
  const changeLog: Record<string, string[]> = {
    '1.0.0': [
      'Полная интеграция трех приложений в одно',
      'Admin Panel для управления контентом',
      'Enhanced Book Reader с оффлайн режимом',
      'Global Audio Player для нашидов',
      'Prayer Times Service с Adhan библиотекой',
      'Elasticsearch для быстрого поиска',
      'AI-ассистент с контекстной памятью',
    ],
    '1.1.0': [
      'Улучшенная система закладок',
      'Поддержка highlight и аннотаций',
      'Семантический поиск по Корану',
      'Расширенная навигация (Juz, Hizb, Sajda)',
    ],
  };

  // Return changes for current version if client is older
  return changeLog[version] || ['Новые улучшения и исправления'];
}

export default router;

/**
 * Prayer Notifications Manager
 * Handles persistent storage of notification state
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTIFIED_FILE = path.join(__dirname, '../../data/notified-prayers.json');

// In-memory set of notified prayers
const notifiedPrayers = new Set<string>();

/**
 * Load notified prayers from file
 */
export function loadNotifiedPrayers(): void {
  try {
    if (fs.existsSync(NOTIFIED_FILE)) {
      const data = fs.readFileSync(NOTIFIED_FILE, 'utf8');
      const notified: string[] = JSON.parse(data);

      notified.forEach((key) => {
        notifiedPrayers.add(key);
      });

      console.log(`✅ Loaded ${notifiedPrayers.size} notification records`);
    } else {
      console.log('📁 No notifications file found, starting fresh');
    }
  } catch (error) {
    console.error('❌ Error loading notified prayers:', error);
  }
}

/**
 * Save notified prayers to file
 */
export function saveNotifiedPrayers(): void {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(NOTIFIED_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const notified = Array.from(notifiedPrayers);
    fs.writeFileSync(NOTIFIED_FILE, JSON.stringify(notified, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ Error saving notified prayers:', error);
  }
}

/**
 * Check if prayer was already notified
 */
export function wasNotified(key: string): boolean {
  return notifiedPrayers.has(key);
}

/**
 * Mark prayer as notified
 */
export function markAsNotified(key: string): void {
  notifiedPrayers.add(key);
  saveNotifiedPrayers();
}

/**
 * Clear all notifications (called at midnight)
 */
export function clearNotifications(): void {
  notifiedPrayers.clear();
  saveNotifiedPrayers();
  console.log('🧹 Cleared old prayer notifications');
}

/**
 * Get count of notified prayers
 */
export function getNotifiedCount(): number {
  return notifiedPrayers.size;
}

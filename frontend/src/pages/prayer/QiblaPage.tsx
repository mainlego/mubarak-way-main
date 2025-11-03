/**
 * Qibla Page
 * Shows 3D compass for Qibla direction
 */

import React from 'react';
import { QiblaCompass } from '@widgets/QiblaCompass';

export default function QiblaPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">🕋</span>
            <h1 className="text-2xl font-bold">Компас Кибла</h1>
          </div>
          <p className="text-white/90">
            Определите направление на Мекку с помощью 3D компаса
          </p>
        </div>
      </div>

      {/* Compass */}
      <QiblaCompass />
    </div>
  );
}

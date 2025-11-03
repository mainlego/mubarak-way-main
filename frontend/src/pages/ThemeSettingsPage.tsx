import { Card } from '@shared/ui';
import ThemeSwitcher from '@widgets/ThemeSwitcher';
import { useTheme } from '@shared/context/ThemeContext';
import { Palette, Info } from 'lucide-react';

export default function ThemeSettingsPage() {
  const { themeConfig } = useTheme();

  return (
    <div className="page-container bg-gradient-primary min-h-screen">
      {/* Header */}
      <header className="container-app pt-6 pb-4 safe-top">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container bg-gradient-accent">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Настройки темы</h1>
            <p className="text-sm text-text-tertiary">Текущая: {themeConfig.displayName}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app space-y-6 pb-24">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Theme Info */}
        <Card variant="glass">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                <strong className="text-text-primary">Темная бирюза:</strong> Классическая тема с
                глубокими бирюзовыми оттенками и золотым акцентом. Идеальна для чтения в любое
                время суток.
              </p>
              <p>
                <strong className="text-text-primary">Песочный:</strong> Светлая тема с теплыми
                песочными тонами. Создает комфортную атмосферу для дневного чтения.
              </p>
              <p>
                <strong className="text-text-primary">Фиолетовый:</strong> Элегантная тема с
                фиолетовыми градиентами. Современный и стильный вариант оформления.
              </p>
            </div>
          </div>
        </Card>

        {/* Color Palette Preview */}
        <Card variant="glass">
          <h3 className="text-base font-bold text-text-primary mb-4">Цветовая палитра</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg shadow-inner"
                style={{ backgroundColor: themeConfig.colors.primary }}
              />
              <p className="text-xs text-text-tertiary text-center">Основной</p>
            </div>

            <div className="space-y-2">
              <div
                className="h-12 rounded-lg shadow-inner"
                style={{ backgroundColor: themeConfig.colors.accent }}
              />
              <p className="text-xs text-text-tertiary text-center">Акцент</p>
            </div>

            <div className="space-y-2">
              <div
                className="h-12 rounded-lg shadow-inner"
                style={{ backgroundColor: themeConfig.colors.primaryLight }}
              />
              <p className="text-xs text-text-tertiary text-center">Светлый</p>
            </div>

            <div className="space-y-2">
              <div
                className="h-12 rounded-lg shadow-inner"
                style={{ backgroundColor: themeConfig.colors.primaryDark }}
              />
              <p className="text-xs text-text-tertiary text-center">Темный</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

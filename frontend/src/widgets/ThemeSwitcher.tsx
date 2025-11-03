import { Card } from '@shared/ui';
import { useTheme } from '@shared/context/ThemeContext';
import { Check } from 'lucide-react';
import { THEMES, ThemeType } from '@shared/types/theme';

export default function ThemeSwitcher() {
  const { theme: currentTheme, setTheme } = useTheme();

  const themeOptions: Array<{
    type: ThemeType;
    name: string;
    description: string;
    preview: string;
  }> = [
    {
      type: 'dark-teal',
      name: 'Темная бирюза',
      description: 'Глубокий и спокойный',
      preview: 'linear-gradient(135deg, #0D3D3F 0%, #1A5456 50%, #277073 100%)',
    },
    {
      type: 'sand',
      name: 'Песочный',
      description: 'Светлый и теплый',
      preview: 'linear-gradient(135deg, #F5E6D3 0%, #FAF0E4 50%, #FDF7EF 100%)',
    },
    {
      type: 'purple',
      name: 'Фиолетовый',
      description: 'Элегантный градиент',
      preview: 'linear-gradient(135deg, #6B4E8C 0%, #8B6EAC 50%, #AB8ECC 100%)',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-1">Выберите тему</h3>
        <p className="text-sm text-text-tertiary">
          Измените внешний вид приложения под ваши предпочтения
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {themeOptions.map((option) => {
          const isSelected = currentTheme === option.type;

          return (
            <Card
              key={option.type}
              variant={isSelected ? 'gradient' : 'glass'}
              hoverable
              onClick={() => setTheme(option.type)}
              className={`
                relative transition-all duration-base
                ${isSelected ? 'ring-2 ring-accent shadow-lg scale-[1.02]' : 'hover:scale-[1.01]'}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Theme Preview */}
                <div className="relative shrink-0">
                  <div
                    className="w-16 h-16 rounded-lg shadow-md"
                    style={{ background: option.preview }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 text-bg-primary" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="flex-1">
                  <h4
                    className={`
                      text-base font-bold mb-1
                      ${isSelected ? 'text-accent' : 'text-text-primary'}
                    `}
                  >
                    {option.name}
                  </h4>
                  <p className="text-sm text-text-tertiary">{option.description}</p>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="shrink-0">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-4 h-4 text-bg-primary" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Preview Info */}
      <Card variant="glass" className="text-center">
        <p className="text-xs text-text-tertiary">
          Тема сохраняется автоматически и применяется ко всем страницам
        </p>
      </Card>
    </div>
  );
}

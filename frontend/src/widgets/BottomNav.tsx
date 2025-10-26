import { useLocation, useNavigate } from 'react-router-dom';
import { haptic } from '@shared/lib/telegram';

const navItems = [
  { path: '/quran', icon: '📖', label: 'Коран' },
  { path: '/library', icon: '📚', label: 'Библиотека' },
  { path: '/', icon: '🕌', label: 'Главная', isMain: true },
  { path: '/progress', icon: '📊', label: 'Прогресс' },
  { path: '/settings', icon: '⚙️', label: 'Настройки' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    haptic.selection();
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-screen-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center min-w-[60px] h-full transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              } ${item.isMain ? 'scale-110' : ''}`}
            >
              <span className={`text-2xl mb-1 ${item.isMain ? 'text-3xl' : ''}`}>
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

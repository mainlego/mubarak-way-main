import { useLocation, useNavigate } from 'react-router-dom';
import { haptic } from '@shared/lib/telegram';
import { Home, BookOpen, Sparkles, Bookmark, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Главная' },
  { path: '/quran', icon: BookOpen, label: 'Коран' },
  { path: '/ai-search', icon: Sparkles, label: 'Поиск', isCenter: true },
  { path: '/progress', icon: Bookmark, label: 'Закладки' },
  { path: '/settings', icon: Settings, label: 'Настройки' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    haptic.selection();
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-card-border safe-bottom z-50">
      <div className="flex items-end justify-around h-20 max-w-screen-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          // Center golden button (AI Search)
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className="flex flex-col items-center justify-center -mt-6 transition-transform hover:scale-105 active:scale-95"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-accent shadow-xl flex items-center justify-center mb-1">
                  <Icon className="w-7 h-7 text-bg-primary" />
                </div>
                <span className="text-xs font-semibold text-accent">{item.label}</span>
              </button>
            );
          }

          // Regular nav items
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`
                flex flex-col items-center justify-center pb-2 pt-3 min-w-[60px]
                transition-all duration-base
                ${isActive ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'}
              `}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

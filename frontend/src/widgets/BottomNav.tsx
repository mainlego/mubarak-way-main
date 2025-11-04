import { useLocation, useNavigate } from 'react-router-dom';
import { haptic } from '@shared/lib/telegram';
import { Home, BookOpen, Sparkles, Library, Music, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Главная' },
  { path: '/quran', icon: BookOpen, label: 'Коран' },
  { path: '/ai-search', icon: Sparkles, label: 'Поиск', isCenter: true },
  { path: '/books', icon: Library, label: 'Книги' },
  { path: '/nashids', icon: Music, label: 'Нашиды' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    haptic.selection();
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a3a3a] safe-bottom z-50 shadow-2xl">
      <div className="flex items-center justify-between h-16 max-w-screen-lg mx-auto px-6 relative">
        {/* Left side items */}
        <div className="flex items-center gap-6">
          {navItems.slice(0, 2).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`
                  flex items-center justify-center w-12 h-12
                  transition-all duration-200
                  ${isActive ? 'text-[#d4af37]' : 'text-gray-400 hover:text-gray-300'}
                `}
                aria-label={item.label}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              </button>
            );
          })}
        </div>

        {/* Center golden button (AI Search) */}
        {navItems.filter(item => item.isCenter).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 -top-6 transition-transform hover:scale-105 active:scale-95"
              aria-label={item.label}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37] via-[#f4d03f] to-[#c9a961] shadow-2xl flex items-center justify-center">
                <Icon className="w-8 h-8 text-[#1a3a3a]" strokeWidth={2.5} />
              </div>
            </button>
          );
        })}

        {/* Right side items */}
        <div className="flex items-center gap-6">
          {navItems.slice(3).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`
                  flex items-center justify-center w-12 h-12
                  transition-all duration-200
                  ${isActive ? 'text-[#d4af37]' : 'text-gray-400 hover:text-gray-300'}
                `}
                aria-label={item.label}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

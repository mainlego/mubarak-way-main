import { Card, Badge, ProgressBar } from '@shared/ui';
import { BookOpen, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SurahCardProps {
  number: number;
  nameArabic: string;
  nameTranslation: string;
  revelationType: 'meccan' | 'medinan';
  versesCount: number;
  readProgress?: number; // 0-100
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function SurahCard({
  number,
  nameArabic,
  nameTranslation,
  revelationType,
  versesCount,
  readProgress = 0,
  isFavorite = false,
  onToggleFavorite,
}: SurahCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/quran/surah/${number}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.();
  };

  return (
    <Card variant="glass" hoverable onClick={handleClick} className="relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative flex items-center gap-4">
        {/* Surah Number Circle */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-accent shrink-0 shadow-md">
          <span className="text-xl font-bold text-bg-primary">{number}</span>
        </div>

        {/* Surah Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-lg font-bold text-text-primary truncate">{nameTranslation}</h3>
            <Badge variant={revelationType === 'meccan' ? 'default' : 'info'}>
              {revelationType === 'meccan' ? 'Мекка' : 'Медина'}
            </Badge>
          </div>

          <p className="text-2xl font-arabic text-accent mb-2 truncate">{nameArabic}</p>

          <div className="flex items-center gap-3 text-sm text-text-tertiary">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {versesCount} аятов
            </span>
            {readProgress > 0 && (
              <span className="text-accent font-semibold">{Math.round(readProgress)}%</span>
            )}
          </div>

          {/* Progress Bar */}
          {readProgress > 0 && (
            <div className="mt-2">
              <ProgressBar value={readProgress} max={100} variant="gradient" className="h-1.5" />
            </div>
          )}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="shrink-0 p-2 rounded-full hover:bg-card transition-colors"
            aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <Star
              className={`w-5 h-5 transition-all ${
                isFavorite
                  ? 'fill-accent text-accent scale-110'
                  : 'text-text-tertiary hover:text-accent'
              }`}
            />
          </button>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
    </Card>
  );
}

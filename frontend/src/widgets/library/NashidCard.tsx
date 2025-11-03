import { Card, Badge } from '@shared/ui';
import { Music, Play, Pause, Download, Heart } from 'lucide-react';

interface NashidCardProps {
  id: number;
  title: string;
  artist: string;
  duration: string; // "3:45"
  category?: string;
  coverImage?: string;
  isPlaying?: boolean;
  isDownloaded?: boolean;
  isFavorite?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onToggleFavorite?: () => void;
  onDownload?: () => void;
}

export default function NashidCard({
  id,
  title,
  artist,
  duration,
  category,
  coverImage,
  isPlaying = false,
  isDownloaded = false,
  isFavorite = false,
  onPlay,
  onPause,
  onToggleFavorite,
  onDownload,
}: NashidCardProps) {
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.();
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.();
  };

  return (
    <Card variant="glass" className="relative overflow-hidden group">
      <div className="flex items-center gap-4">
        {/* Cover Image / Play Button */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-primary flex items-center justify-center">
            {coverImage ? (
              <img src={coverImage} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-8 h-8 text-accent opacity-50" />
            )}
          </div>

          {/* Play/Pause Overlay */}
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white" />
            )}
          </button>
        </div>

        {/* Nashid Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-text-primary truncate group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="text-sm text-text-secondary truncate">{artist}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-text-tertiary">{duration}</span>
            {category && (
              <>
                <span className="text-xs text-text-tertiary">•</span>
                <Badge variant="default" className="text-[10px] py-0">
                  {category}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              className="p-2 rounded-lg hover:bg-card transition-colors"
              aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  isFavorite
                    ? 'fill-accent text-accent'
                    : 'text-text-tertiary hover:text-accent'
                }`}
              />
            </button>
          )}

          {onDownload && !isDownloaded && (
            <button
              onClick={handleDownloadClick}
              className="p-2 rounded-lg hover:bg-card transition-colors"
              aria-label="Скачать"
            >
              <Download className="w-5 h-5 text-text-tertiary hover:text-accent" />
            </button>
          )}

          {isDownloaded && (
            <div className="p-2">
              <div className="w-2 h-2 rounded-full bg-success" />
            </div>
          )}
        </div>
      </div>

      {/* Playing Indicator */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent">
          <div className="h-full w-1/2 bg-accent-light animate-pulse" />
        </div>
      )}
    </Card>
  );
}

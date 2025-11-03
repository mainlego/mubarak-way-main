import { Card, Badge } from '@shared/ui';
import { BookOpen, Download, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  category: string;
  pages?: number;
  coverImage?: string;
  isDownloaded?: boolean;
  isFavorite?: boolean;
  readProgress?: number; // 0-100
  onToggleFavorite?: () => void;
  onDownload?: () => void;
}

export default function BookCard({
  id,
  title,
  author,
  category,
  pages,
  coverImage,
  isDownloaded = false,
  isFavorite = false,
  readProgress = 0,
  onToggleFavorite,
  onDownload,
}: BookCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/library/books/${id}`);
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
    <Card variant="glass" hoverable onClick={handleClick} className="relative overflow-hidden group">
      {/* Cover Image or Placeholder */}
      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gradient-primary">
        {coverImage ? (
          <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-accent opacity-50" />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          <Badge variant="default">{category}</Badge>
          {isDownloaded && (
            <div className="p-1.5 rounded-full bg-success">
              <Download className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Progress Overlay */}
        {readProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-card-border">
            <div
              className="h-full bg-gradient-accent transition-all"
              style={{ width: `${readProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        <p className="text-sm text-text-secondary">{author}</p>

        {pages && (
          <p className="text-xs text-text-tertiary flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {pages} страниц
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4">
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="flex-1 btn btn-secondary text-sm py-2"
          >
            <Star
              className={`w-4 h-4 ${isFavorite ? 'fill-accent text-accent' : ''}`}
            />
            {isFavorite ? 'В избранном' : 'В избранное'}
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
      </div>
    </Card>
  );
}

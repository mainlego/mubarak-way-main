import { Card } from '@shared/ui';
import { Bookmark, Share2, Volume2, Copy } from 'lucide-react';
import { useState } from 'react';

interface VerseCardProps {
  verseNumber: number;
  arabicText: string;
  translation: string;
  transliteration?: string;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onShare?: () => void;
  onPlay?: () => void;
  onCopy?: () => void;
}

export default function VerseCard({
  verseNumber,
  arabicText,
  translation,
  transliteration,
  isBookmarked = false,
  onBookmark,
  onShare,
  onPlay,
  onCopy,
}: VerseCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card
      variant="glass"
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Verse Number Badge */}
      <div className="absolute -top-3 -right-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-accent shadow-lg">
          <span className="text-sm font-bold text-bg-primary">{verseNumber}</span>
        </div>
      </div>

      {/* Arabic Text */}
      <div className="mb-4">
        <p className="text-2xl font-arabic text-right leading-loose text-text-primary">
          {arabicText}
        </p>
      </div>

      {/* Transliteration (if provided) */}
      {transliteration && (
        <div className="mb-3 p-3 bg-card/30 rounded-lg">
          <p className="text-sm italic text-text-tertiary text-right">{transliteration}</p>
        </div>
      )}

      {/* Translation */}
      <div className="mb-4">
        <p className="text-base text-text-secondary leading-relaxed">{translation}</p>
      </div>

      {/* Action Buttons */}
      <div
        className={`
          flex items-center justify-end gap-2
          transition-all duration-base
          ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}
        `}
      >
        {onPlay && (
          <button
            onClick={onPlay}
            className="p-2 rounded-lg hover:bg-card transition-colors"
            aria-label="Прослушать"
          >
            <Volume2 className="w-5 h-5 text-text-tertiary hover:text-accent" />
          </button>
        )}

        {onBookmark && (
          <button
            onClick={onBookmark}
            className="p-2 rounded-lg hover:bg-card transition-colors"
            aria-label={isBookmarked ? 'Удалить закладку' : 'Добавить закладку'}
          >
            <Bookmark
              className={`w-5 h-5 transition-all ${
                isBookmarked
                  ? 'fill-accent text-accent'
                  : 'text-text-tertiary hover:text-accent'
              }`}
            />
          </button>
        )}

        {onCopy && (
          <button
            onClick={onCopy}
            className="p-2 rounded-lg hover:bg-card transition-colors"
            aria-label="Копировать"
          >
            <Copy className="w-5 h-5 text-text-tertiary hover:text-accent" />
          </button>
        )}

        {onShare && (
          <button
            onClick={onShare}
            className="p-2 rounded-lg hover:bg-card transition-colors"
            aria-label="Поделиться"
          >
            <Share2 className="w-5 h-5 text-text-tertiary hover:text-accent" />
          </button>
        )}
      </div>

      {/* Decorative Border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-accent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}

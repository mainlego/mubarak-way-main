import { Card, Badge } from '@shared/ui';
import { Check, Clock, Bell } from 'lucide-react';

interface PrayerCardProps {
  name: string;
  nameAr: string;
  time: string;
  isPassed: boolean;
  isCompleted?: boolean;
  isNext?: boolean;
  onToggleComplete?: () => void;
}

export default function PrayerCard({
  name,
  nameAr,
  time,
  isPassed,
  isCompleted = false,
  isNext = false,
  onToggleComplete,
}: PrayerCardProps) {
  return (
    <Card
      variant={isNext ? 'gradient' : 'glass'}
      hoverable={!!onToggleComplete}
      onClick={onToggleComplete}
      className={`
        relative transition-all duration-base
        ${isNext ? 'ring-2 ring-accent shadow-xl' : ''}
        ${isCompleted ? 'bg-accent/10' : ''}
      `}
    >
      {/* Status Badge */}
      {isNext && (
        <div className="absolute top-3 right-3">
          <Badge variant="default">
            <Bell className="w-3 h-3 mr-1" />
            Следующая
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Completion Status Circle */}
        <div
          className={`
            flex items-center justify-center
            w-14 h-14 rounded-full shrink-0
            transition-all duration-base
            ${
              isCompleted
                ? 'bg-accent'
                : isPassed
                ? 'bg-error/20 border-2 border-error'
                : 'bg-card border-2 border-card-border'
            }
          `}
        >
          {isCompleted ? (
            <Check className="w-7 h-7 text-bg-primary" />
          ) : isPassed ? (
            <span className="text-lg text-error">✕</span>
          ) : (
            <Clock className="w-6 h-6 text-text-tertiary" />
          )}
        </div>

        {/* Prayer Info */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <h3
              className={`
                text-xl font-bold
                ${isCompleted ? 'text-accent' : 'text-text-primary'}
                ${isPassed && !isCompleted ? 'opacity-50' : ''}
              `}
            >
              {name}
            </h3>
            <span
              className={`
                text-lg font-arabic
                ${isCompleted ? 'text-accent' : 'text-text-secondary'}
              `}
            >
              {nameAr}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-tertiary" />
            <span
              className={`
                text-lg font-semibold
                ${isNext ? 'text-accent' : 'text-text-secondary'}
              `}
            >
              {time}
            </span>
            {isPassed && !isCompleted && (
              <Badge variant="error">Пропущено</Badge>
            )}
            {isCompleted && <Badge variant="success">Выполнено</Badge>}
          </div>
        </div>

        {/* Action Hint */}
        {onToggleComplete && !isPassed && (
          <div className="text-text-tertiary text-xs text-right">
            {isCompleted ? 'Отметить как\nневыполненное' : 'Отметить как\nвыполненное'}
          </div>
        )}
      </div>

      {/* Next Prayer Glow Effect */}
      {isNext && (
        <div className="absolute inset-0 rounded-lg bg-gradient-accent opacity-5 pointer-events-none" />
      )}
    </Card>
  );
}

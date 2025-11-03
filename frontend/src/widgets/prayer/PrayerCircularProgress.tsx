import { CircularProgress } from '@shared/ui';
import { Check } from 'lucide-react';

interface Prayer {
  name: string;
  nameAr: string;
  time: string;
  isPassed: boolean;
  isCompleted?: boolean;
}

interface PrayerCircularProgressProps {
  prayers: Prayer[];
  currentProgress: number;
  nextPrayerIndex: number;
}

export default function PrayerCircularProgress({
  prayers,
  currentProgress,
  nextPrayerIndex,
}: PrayerCircularProgressProps) {
  const totalPrayers = prayers.length;
  const completedPrayers = prayers.filter((p) => p.isCompleted).length;
  const progressPercentage = (completedPrayers / totalPrayers) * 100;

  return (
    <div className="relative flex flex-col items-center">
      {/* Main Circular Progress */}
      <div className="relative">
        <CircularProgress value={progressPercentage} max={100} size={200} strokeWidth={12}>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent">
              {completedPrayers}/{totalPrayers}
            </div>
            <div className="text-sm text-text-tertiary mt-1">Молитв</div>
          </div>
        </CircularProgress>

        {/* Prayer Points around Circle */}
        {prayers.map((prayer, index) => {
          const angle = (index / totalPrayers) * 360 - 90; // Start from top
          const radius = 110; // Distance from center
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          const isNext = index === nextPrayerIndex;
          const isCompleted = prayer.isCompleted;

          return (
            <div
              key={prayer.name}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              {/* Prayer Point */}
              <div
                className={`
                  relative flex items-center justify-center
                  w-12 h-12 rounded-full
                  transition-all duration-base
                  ${
                    isCompleted
                      ? 'bg-accent shadow-lg scale-110'
                      : isNext
                      ? 'bg-card border-2 border-accent pulse-glow'
                      : 'bg-card-border'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 text-bg-primary" />
                ) : (
                  <span className="text-sm font-bold text-text-primary">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Prayer Name Label */}
              <div
                className={`
                  absolute top-full mt-2 left-1/2 -translate-x-1/2
                  whitespace-nowrap text-center
                `}
              >
                <div
                  className={`
                    text-xs font-semibold
                    ${isNext ? 'text-accent' : 'text-text-secondary'}
                  `}
                >
                  {prayer.name}
                </div>
                <div className="text-[10px] text-text-tertiary">{prayer.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Prayer Info */}
      {nextPrayerIndex >= 0 && nextPrayerIndex < prayers.length && (
        <div className="mt-32 text-center">
          <p className="text-sm text-text-tertiary mb-1">Следующая молитва</p>
          <p className="text-xl font-bold text-accent">
            {prayers[nextPrayerIndex].name}
          </p>
          <p className="text-2xl font-arabic text-text-primary">
            {prayers[nextPrayerIndex].nameAr}
          </p>
          <p className="text-lg text-text-secondary mt-1">
            {prayers[nextPrayerIndex].time}
          </p>
        </div>
      )}
    </div>
  );
}

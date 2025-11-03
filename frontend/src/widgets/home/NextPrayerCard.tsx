import { CircularProgress, Card } from '@shared/ui';
import { Clock } from 'lucide-react';

interface NextPrayerCardProps {
  prayerName: string;
  prayerNameAr: string;
  prayerTime: string;
  timeRemaining: string;
  progress: number;
}

export default function NextPrayerCard({
  prayerName,
  prayerNameAr,
  prayerTime,
  timeRemaining,
  progress,
}: NextPrayerCardProps) {
  return (
    <Card variant="gradient" className="relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />

      <div className="relative flex items-center gap-6 p-6">
        {/* Circular Progress */}
        <div className="relative">
          <CircularProgress value={progress} max={100} size={100} strokeWidth={6}>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">{Math.round(progress)}%</div>
            </div>
          </CircularProgress>
        </div>

        {/* Prayer Info */}
        <div className="flex-1 space-y-2">
          {/* Prayer Name */}
          <div>
            <h3 className="text-2xl font-bold text-text-primary">{prayerName}</h3>
            <p className="text-lg font-arabic text-text-secondary">{prayerNameAr}</p>
          </div>

          {/* Time Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-accent">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-semibold">{prayerTime}</span>
            </div>
            <div className="text-sm text-text-tertiary">
              {timeRemaining}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar mt-2">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

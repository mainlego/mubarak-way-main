import { Card, CircularProgress, ProgressBar } from '@shared/ui';
import { BookOpen, Clock, Target, TrendingUp } from 'lucide-react';

interface QuranStatsProps {
  totalSurahsRead: number;
  totalSurahs: number;
  totalVersesRead: number;
  totalVerses: number;
  readingStreak: number;
  todayReadingTime: number; // minutes
  weeklyGoal: number; // verses
  weeklyProgress: number; // verses read this week
}

export default function QuranStats({
  totalSurahsRead,
  totalSurahs,
  totalVersesRead,
  totalVerses,
  readingStreak,
  todayReadingTime,
  weeklyGoal,
  weeklyProgress,
}: QuranStatsProps) {
  const surahProgress = (totalSurahsRead / totalSurahs) * 100;
  const verseProgress = (totalVersesRead / totalVerses) * 100;
  const weeklyGoalProgress = (weeklyProgress / weeklyGoal) * 100;

  return (
    <div className="space-y-4">
      {/* Main Progress Card */}
      <Card variant="gradient" className="relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative">
          <h3 className="text-lg font-bold text-text-primary mb-4">Прогресс чтения Корана</h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Surah Progress */}
            <div className="text-center">
              <CircularProgress value={surahProgress} max={100} size={100} strokeWidth={8}>
                <div className="text-center">
                  <div className="text-xl font-bold text-accent">{totalSurahsRead}</div>
                  <div className="text-[10px] text-text-tertiary">из {totalSurahs}</div>
                </div>
              </CircularProgress>
              <p className="text-sm text-text-secondary mt-2">Сур прочитано</p>
            </div>

            {/* Verse Progress */}
            <div className="text-center">
              <CircularProgress value={verseProgress} max={100} size={100} strokeWidth={8}>
                <div className="text-center">
                  <div className="text-xl font-bold text-accent">{Math.round(verseProgress)}%</div>
                </div>
              </CircularProgress>
              <p className="text-sm text-text-secondary mt-2">
                {totalVersesRead} аятов
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Reading Streak */}
        <Card variant="glass" className="text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="icon-container bg-gradient-accent">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{readingStreak}</p>
              <p className="text-xs text-text-tertiary">дней подряд</p>
            </div>
          </div>
        </Card>

        {/* Today's Time */}
        <Card variant="glass" className="text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="icon-container bg-gradient-accent">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{todayReadingTime}</p>
              <p className="text-xs text-text-tertiary">минут сегодня</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Goal */}
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-3">
          <div className="icon-container icon-sm bg-gradient-accent">
            <Target className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">Недельная цель</p>
            <p className="text-xs text-text-tertiary">
              {weeklyProgress} / {weeklyGoal} аятов
            </p>
          </div>
          <span className="text-lg font-bold text-accent">{Math.round(weeklyGoalProgress)}%</span>
        </div>
        <ProgressBar value={weeklyProgress} max={weeklyGoal} variant="gradient" />
      </Card>

      {/* Achievements (Future Feature) */}
      {/* <Card variant="glass">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-text-primary">Достижения</h4>
          <BookOpen className="w-4 h-4 text-text-tertiary" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-card border border-card-border flex items-center justify-center"
            >
              <span className="text-2xl">🏆</span>
            </div>
          ))}
        </div>
      </Card> */}
    </div>
  );
}

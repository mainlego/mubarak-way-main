import { Card, ProgressBar, Badge } from '@shared/ui';
import { CheckCircle2, Circle } from 'lucide-react';

interface DailyGoal {
  id: string;
  title: string;
  titleAr?: string;
  progress: number;
  total: number;
  isCompleted: boolean;
  icon?: string;
}

interface DailyGoalsListProps {
  goals: DailyGoal[];
}

export default function DailyGoalsList({ goals }: DailyGoalsListProps) {
  const completedCount = goals.filter(g => g.isCompleted).length;
  const totalProgress = Math.round((completedCount / goals.length) * 100);

  return (
    <Card variant="glass" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          Ежедневные цели
        </h2>
        <Badge variant="default">
          {completedCount}/{goals.length}
        </Badge>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Общий прогресс</span>
          <span className="font-semibold text-accent">{totalProgress}%</span>
        </div>
        <ProgressBar value={totalProgress} max={100} variant="gradient" />
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`
              flex items-start gap-3 p-3 rounded-lg
              transition-all duration-base
              ${goal.isCompleted
                ? 'bg-accent/10 border border-accent/20'
                : 'bg-card/50 hover:bg-card'
              }
            `}
          >
            {/* Icon/Checkbox */}
            <div className="mt-0.5">
              {goal.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-accent" />
              ) : (
                <Circle className="w-5 h-5 text-text-tertiary" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`
                    font-medium
                    ${goal.isCompleted
                      ? 'text-text-secondary line-through'
                      : 'text-text-primary'
                    }
                  `}>
                    {goal.icon && <span className="mr-2">{goal.icon}</span>}
                    {goal.title}
                  </p>
                  {goal.titleAr && (
                    <p className="text-sm font-arabic text-text-tertiary mt-0.5">
                      {goal.titleAr}
                    </p>
                  )}
                </div>
                <span className="text-xs font-semibold text-text-tertiary whitespace-nowrap">
                  {goal.progress}/{goal.total}
                </span>
              </div>

              {/* Progress Bar */}
              {!goal.isCompleted && (
                <ProgressBar
                  value={goal.progress}
                  max={goal.total}
                  variant="gradient"
                  className="h-1.5"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

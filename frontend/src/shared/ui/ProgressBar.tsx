import clsx from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
  variant?: 'default' | 'gradient';
}

export default function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  className,
  variant = 'gradient',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-text-secondary">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="progress-bar">
        <div
          className={clsx('progress-bar-fill', {
            'bg-accent': variant === 'default',
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

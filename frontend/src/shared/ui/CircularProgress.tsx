import React from 'react';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  className?: string;
}

export default function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  children,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`circular-progress ${className || ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="circular-progress-ring">
        {/* Background circle */}
        <circle
          className="circular-progress-circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className="circular-progress-circle-fg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

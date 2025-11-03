import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  const variantClasses = {
    default: 'badge',
    success: 'bg-success text-bg-primary',
    warning: 'bg-warning text-bg-primary',
    error: 'bg-error text-white',
    info: 'bg-info text-white',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center',
        'px-2 py-0.5 text-xs font-semibold',
        'rounded-full',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

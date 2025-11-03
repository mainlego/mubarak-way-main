import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  noPadding?: boolean;
  variant?: 'default' | 'glass' | 'gradient' | 'solid';
}

export default function Card({
  children,
  hoverable = false,
  noPadding = false,
  variant = 'glass',
  className,
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'card',
    glass: 'glass rounded-lg shadow-card',
    gradient: 'card-gradient rounded-lg shadow-card',
    solid: 'bg-bg-secondary rounded-lg shadow-card',
  };

  return (
    <div
      className={clsx(
        variantClasses[variant],
        {
          'hover-lift cursor-pointer': hoverable,
          'p-4': !noPadding,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

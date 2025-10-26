import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  noPadding?: boolean;
}

export default function Card({
  children,
  hoverable = false,
  noPadding = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'card',
        {
          'cursor-pointer': hoverable,
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

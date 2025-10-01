import React from 'react';
import { cn } from '@/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ 
  children, 
  className, 
  padding = 'md',
  hover = false,
  ...props 
}: CardProps): React.ReactElement {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-soft',
        paddingClasses[padding],
        hover && 'hover:shadow-medium transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

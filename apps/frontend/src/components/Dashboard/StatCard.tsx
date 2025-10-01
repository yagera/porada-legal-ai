import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'slate';
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  className,
}: StatCardProps): React.ReactElement {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-200',
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      border: 'border-amber-200',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      border: 'border-red-200',
    },
    slate: {
      bg: 'bg-slate-50',
      icon: 'text-slate-600',
      border: 'border-slate-200',
    },
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-600',
  };

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : 
                    trend?.direction === 'down' ? TrendingDown : Minus;

  const currentColor = colorClasses[color];

  return (
    <div className={cn(
      'bg-white rounded-xl border shadow-soft p-6',
      currentColor.border,
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">
            {title}
          </p>
          <p className="text-2xl font-heading font-bold text-slate-900">
            {value}
          </p>
          {trend && (
            <div className={cn(
              'flex items-center mt-2 text-sm font-medium',
              trendColors[trend.direction]
            )}>
              <TrendIcon className="h-4 w-4 mr-1" />
              <span>
                {trend.direction === 'neutral' ? 'No change' : `${trend.value}%`}
              </span>
              <span className="text-slate-500 ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          'flex items-center justify-center w-12 h-12 rounded-lg',
          currentColor.bg
        )}>
          <Icon className={cn('h-6 w-6', currentColor.icon)} />
        </div>
      </div>
    </div>
  );
}

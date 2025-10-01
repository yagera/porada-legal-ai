import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps): React.ReactElement {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <Link 
      to="/dashboard" 
      className={cn(
        'flex items-center space-x-2 hover:opacity-80 transition-opacity',
        className
      )}
      aria-label="Перейти на главную страницу"
    >
      {}
      <div className={cn(
        'flex items-center justify-center rounded-lg overflow-hidden',
        sizeClasses[size]
      )}>
        <img 
          src="/images/logo.png"
          alt="Porada Logo"
          className={cn(
            'object-contain',
            size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'
          )}
        />
      </div>

      {showText && (
        <div>
          <h1 className={cn(
            'font-heading font-semibold text-navy-900',
            textSizeClasses[size]
          )}>
            Porada
          </h1>
          <p className={cn(
            'text-slate-500 -mt-1',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : 'text-sm'
          )}>
            Legal AI Assistant
          </p>
        </div>
      )}
    </Link>
  );
}
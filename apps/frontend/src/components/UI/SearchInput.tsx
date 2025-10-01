import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils';
import { Button } from './Button';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className,
  disabled = false,
  autoFocus = false,
}: SearchInputProps): React.ReactElement {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onSearch) {
      event.preventDefault();
      onSearch(value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onChange('');
    }
  };

  const handleClear = () => {
    onChange('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        {}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>

        {}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            'block w-full pl-10 pr-20 py-2 border border-slate-300 rounded-lg',
            'text-sm placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            isFocused && 'border-blue-500',
            className
          )}
          aria-label="Search input"
        />

        {}
        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          {}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="mr-1 h-6 w-6 p-0"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSearch}
            disabled={disabled || !value}
            className="h-8 px-3"
            aria-label="Search"
          >
            Search
          </Button>
        </div>
      </div>

      {}
      {isFocused && value && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-medium z-50">
          <div className="p-3 text-sm text-slate-500">
            Press Enter to search or Escape to clear
          </div>
        </div>
      )}
    </div>
  );
}

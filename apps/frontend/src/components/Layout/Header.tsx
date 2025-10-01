import React from 'react';
import { Menu, Search, Settings } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { SearchInput } from '@/components/UI/SearchInput';
import { NotificationDropdown } from '@/components/Notification/NotificationDropdown';
import { UserDropdown } from '@/components/User/UserDropdown';
import { Logo } from '@/components/UI/Logo';
import { useSearch } from '@/hooks/useSearch';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps): React.ReactElement {
  const { searchQuery, setSearchQuery, handleSearch } = useSearch();

  return (
    <header className="bg-white border-b border-slate-200 shadow-soft sticky top-0 z-50">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {}
          <div className="flex items-center space-x-4">
            {}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {}
            <Logo size="md" showText={true} />
          </div>

          {}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search documents, analyses, or clauses..."
              className="w-full"
            />
          </div>

          {}
          <div className="flex items-center space-x-2">
            {}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {}
            <NotificationDropdown />

            {}
            <Button
              variant="ghost"
              size="sm"
              aria-label="Quick settings"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {}
            <UserDropdown />
          </div>
        </div>

        {}
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Search documents, analyses, or clauses..."
            className="w-full"
          />
        </div>
      </div>
    </header>
  );
}

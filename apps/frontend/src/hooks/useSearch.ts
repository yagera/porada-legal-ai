import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { debounce } from '@/utils';

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {

        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }, 300),
    [navigate]
  );

  const handleSearch = useCallback((query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    clearSearch,
  };
}

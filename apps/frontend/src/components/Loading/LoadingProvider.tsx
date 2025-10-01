import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingOverlay } from './LoadingOverlay';
import { LoadingState } from '@/types';

interface LoadingContextType {
  isLoading: boolean;
  progress?: number;
  message?: string;
  showLoading: (state: Partial<LoadingState>) => void;
  hideLoading: () => void;
  updateProgress: (progress: number, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps): React.ReactElement {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
  });

  const showLoading = useCallback((state: Partial<LoadingState>) => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      message: 'Loading...',
      ...state,
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
    });
  }, []);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      ...(message && { message }),
    }));
  }, []);

  const value = {
    isLoading: loadingState.isLoading,
    progress: loadingState.progress,
    message: loadingState.message,
    showLoading,
    hideLoading,
    updateProgress,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay
        isLoading={loadingState.isLoading}
        progress={loadingState.progress}
        message={loadingState.message}
      />
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

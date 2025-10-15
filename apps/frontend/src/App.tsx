import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Layout } from '@/components/Layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { NotificationProvider } from '@/components/Notification/NotificationProvider';
import { LoadingProvider } from '@/components/Loading/LoadingProvider';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { DocumentUpload } from '@/pages/DocumentUpload/DocumentUpload';
import { AnalysisResults } from '@/pages/AnalysisResults/AnalysisResults';
import { History } from '@/pages/History/History';
import { Settings } from '@/pages/Settings/Settings';
import { NotFound } from '@/pages/NotFound/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

export function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <LoadingProvider>
            <div className="min-h-screen bg-background-primary">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="upload" element={<DocumentUpload />} />
                  <Route path="analysis/:analysisId" element={<AnalysisResults />} />
                  <Route path="history" element={<History />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </LoadingProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

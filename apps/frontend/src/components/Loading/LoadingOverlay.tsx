import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export function LoadingOverlay({
  isLoading,
  progress,
  message = 'Loading...',
}: LoadingOverlayProps): React.ReactElement {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Loading"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="bg-white rounded-xl p-8 shadow-strong max-w-sm w-full mx-4"
          >
            {}
            <div className="flex justify-center mb-6">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>

            {}
            <div className="text-center mb-6">
              <h3 className="text-lg font-heading font-semibold text-slate-900 mb-2">
                {message}
              </h3>
              {progress !== undefined && (
                <p className="text-sm text-slate-600">
                  {Math.round(progress)}% complete
                </p>
              )}
            </div>

            {}
            {progress !== undefined && (
              <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            )}

            {}
            <div className="text-center">
              <p className="text-xs text-slate-500">
                Please wait while we process your request...
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

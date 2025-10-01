import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/UI/Button';

export function NotFound(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          {}
          <div className="text-8xl font-heading font-bold text-slate-300 mb-4">
            404
          </div>

          {}
          <h1 className="text-2xl font-heading font-semibold text-slate-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-slate-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {}
        <div className="space-y-4">
          <Link to="/dashboard">
            <Button
              size="lg"
              leftIcon={<Home className="h-5 w-5" />}
            >
              Go to Dashboard
            </Button>
          </Link>

          <div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              leftIcon={<ArrowLeft className="h-5 w-5" />}
            >
              Go Back
            </Button>
          </div>
        </div>

        {}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-600 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/upload" className="text-blue-600 hover:text-blue-700">
              Upload Document
            </Link>
            <Link to="/history" className="text-blue-600 hover:text-blue-700">
              View History
            </Link>
            <Link to="/settings" className="text-blue-600 hover:text-blue-700">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

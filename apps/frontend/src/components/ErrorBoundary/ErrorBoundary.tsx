import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/UI/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {

    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="card p-8 text-center">
              {}
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>

              {}
              <h1 className="text-2xl font-heading font-semibold text-slate-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-slate-600 mb-6">
                We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
              </p>

              {}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-slate-900 mb-2">Error Details:</h3>
                  <pre className="text-xs text-slate-600 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}

              {}
              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full"
                  leftIcon={<Home className="h-4 w-4" />}
                >
                  Go to Dashboard
                </Button>
              </div>

              {}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  If this problem persists, please contact{' '}
                  <a
                    href="mailto:support@porada.com"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    support@porada.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

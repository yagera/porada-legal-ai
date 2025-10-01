import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/UI/Card';
import { cn, formatRelativeTime, getRiskLevelColor } from '@/utils';
import { RiskLevel } from '@/types';

interface Analysis {
  id: string;
  name: string;
  status: 'completed' | 'processing' | 'failed';
  riskLevel: RiskLevel | null;
  completedAt: Date | null;
}

interface RecentAnalysesProps {
  analyses: Analysis[];
}

export function RecentAnalyses({ analyses }: RecentAnalysesProps): React.ReactElement {
  const getStatusIcon = (status: Analysis['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'processing':
        return Clock;
      case 'failed':
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: Analysis['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusText = (status: Analysis['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-slate-900 mb-2">
            Recent Analyses
          </h2>
          <p className="text-slate-600">
            Your latest document analyses
          </p>
        </div>
        <Link to="/history">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        {analyses.map((analysis) => {
          const StatusIcon = getStatusIcon(analysis.status);

          return (
            <Link
              key={analysis.id}
              to={`/analysis/${analysis.id}`}
              className="block p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-soft transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {}
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>

                  {}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 truncate">
                      {analysis.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {}
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                        getStatusColor(analysis.status)
                      )}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusText(analysis.status)}
                      </span>

                      {}
                      {analysis.riskLevel && (
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                          getRiskLevelColor(analysis.riskLevel)
                        )}>
                          {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)} Risk
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {}
                {analysis.completedAt && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-slate-500">
                      {formatRelativeTime(analysis.completedAt)}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {analyses.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No analyses yet
          </h3>
          <p className="text-slate-600 mb-4">
            Upload your first document to get started with contract analysis.
          </p>
          <Link to="/upload">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Upload Document
            </button>
          </Link>
        </div>
      )}
    </Card>
  );
}

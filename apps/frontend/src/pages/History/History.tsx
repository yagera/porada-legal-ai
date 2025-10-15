import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Eye } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { SearchInput } from '@/components/UI/SearchInput';
import { cn, formatRelativeTime, getRiskLevelColor } from '@/utils';
import { RiskLevel } from '@/types';
import { useNotifications } from '@/components/Notification/NotificationProvider';
import { apiClient } from '@/utils/api';

interface Analysis {
  analysis_id: string;
  filename: string;
  status: string;
  risk_level: string;
  created_at: string;
  file_size: number;
}

export function History(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel | 'all'>('all');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const { showNotification } = useNotifications();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const data = await apiClient.get<Analysis[]>('/api/analyses');
      setAnalyses(data);
    } catch (error) {
      console.error('Error loading analyses:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load analysis history',
      });
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = selectedRiskLevel === 'all' || analysis.risk_level === selectedRiskLevel;
    return matchesSearch && matchesRisk;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-8">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            Analysis History
          </h1>
          <p className="mt-2 text-slate-600">
            View and manage your past document analyses
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button leftIcon={<Download className="h-4 w-4" />}>
            Export All
          </Button>
        </div>
      </div>

      {}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Documents
            </label>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by document name..."
            />
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Risk Level
            </label>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value as RiskLevel | 'all')}
              className="input w-full"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date Range
            </label>
            <select className="input w-full">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
      </Card>

      {}
      <Card>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold text-slate-900">
              Analyses ({filteredAnalyses.length})
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Sort by:</span>
              <select className="text-sm border border-slate-300 rounded px-2 py-1">
                <option value="date">Date</option>
                <option value="risk">Risk Level</option>
                <option value="name">Document Name</option>
              </select>
            </div>
          </div>
        </div>

        {}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                    Document
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                    Risk Level
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                    Uploaded
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                    Completed
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAnalyses.map((analysis) => (
                  <tr key={analysis.analysis_id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                            📄
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {analysis.filename}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(analysis.status)
                      )}>
                        {getStatusIcon(analysis.status)} {analysis.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {analysis.risk_level ? (
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          getRiskLevelColor(analysis.risk_level as RiskLevel)
                        )}>
                          {analysis.risk_level.charAt(0).toUpperCase() + analysis.risk_level.slice(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {formatRelativeTime(new Date(analysis.created_at))}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {analysis.status === 'completed' ? formatRelativeTime(new Date(analysis.created_at)) : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {analysis.status === 'completed' && (
                          <Link to={`/analysis/${analysis.analysis_id}`}>
                            <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                              View
                            </Button>
                          </Link>
                        )}
                        <Button variant="ghost" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                          Export
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {}
        <div className="md:hidden space-y-4">
          {filteredAnalyses.map((analysis) => (
            <div key={analysis.analysis_id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-900 truncate">
                    {analysis.filename}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(analysis.status)
                    )}>
                      {getStatusIcon(analysis.status)} {analysis.status}
                    </span>
                    {analysis.risk_level && (
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        getRiskLevelColor(analysis.risk_level as RiskLevel)
                      )}>
                        {analysis.risk_level.charAt(0).toUpperCase() + analysis.risk_level.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>Uploaded: {formatRelativeTime(new Date(analysis.created_at))}</span>
                {analysis.status === 'completed' && (
                  <span>Completed: {formatRelativeTime(new Date(analysis.created_at))}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {analysis.status === 'completed' && (
                  <Link to={`/analysis/${analysis.analysis_id}`}>
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                      View
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                  Export
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredAnalyses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No analyses found
            </h3>
            <p className="text-slate-600 mb-4">
              Try adjusting your search criteria or upload a new document.
            </p>
            <Link to="/upload">
              <Button>Upload Document</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Eye } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { SearchInput } from '@/components/UI/SearchInput';
import { cn, formatRelativeTime, getRiskLevelColor } from '@/utils';
import { RiskLevel } from '@/types';

export function History(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel | 'all'>('all');

  const analyses = [
    {
      id: '1',
      documentName: 'Service Agreement.pdf',
      status: 'completed',
      riskLevel: 'medium' as RiskLevel,
      riskScore: 35,
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: '2',
      documentName: 'Employment Contract.pdf',
      status: 'completed',
      riskLevel: 'high' as RiskLevel,
      riskScore: 75,
      completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      uploadedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: '3',
      documentName: 'NDA Template.pdf',
      status: 'processing',
      riskLevel: null,
      riskScore: null,
      completedAt: null,
      uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: '4',
      documentName: 'Software License Agreement.pdf',
      status: 'completed',
      riskLevel: 'low' as RiskLevel,
      riskScore: 15,
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      uploadedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    },
  ];

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.documentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = selectedRiskLevel === 'all' || analysis.riskLevel === selectedRiskLevel;
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
                  <tr key={analysis.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                            📄
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {analysis.documentName}
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
                      {analysis.riskLevel ? (
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          getRiskLevelColor(analysis.riskLevel)
                        )}>
                          {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)}
                          {analysis.riskScore && ` (${analysis.riskScore}%)`}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {formatRelativeTime(analysis.uploadedAt)}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {analysis.completedAt ? formatRelativeTime(analysis.completedAt) : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {analysis.status === 'completed' && (
                          <Link to={`/analysis/${analysis.id}`}>
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
            <div key={analysis.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-900 truncate">
                    {analysis.documentName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(analysis.status)
                    )}>
                      {getStatusIcon(analysis.status)} {analysis.status}
                    </span>
                    {analysis.riskLevel && (
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        getRiskLevelColor(analysis.riskLevel)
                      )}>
                        {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>Uploaded: {formatRelativeTime(analysis.uploadedAt)}</span>
                {analysis.completedAt && (
                  <span>Completed: {formatRelativeTime(analysis.completedAt)}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {analysis.status === 'completed' && (
                  <Link to={`/analysis/${analysis.id}`}>
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

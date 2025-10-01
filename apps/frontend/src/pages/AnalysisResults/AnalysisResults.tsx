import React from 'react';
import { useParams } from 'react-router-dom';
import { Download, Share2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';

export function AnalysisResults(): React.ReactElement {
  const { analysisId } = useParams<{ analysisId: string }>();

  const analysis = {
    id: analysisId || '1',
    documentName: 'Service Agreement.pdf',
    status: 'completed',
    riskLevel: 'medium',
    riskScore: 35,
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    summary: 'This contract shows moderate risk levels with several areas requiring attention. The payment terms and liability clauses need review.',
    clauses: [
      {
        id: '1',
        title: 'Payment Terms',
        riskLevel: 'high',
        issues: ['Payment terms are ambiguous', 'Late payment penalties are excessive'],
        recommendations: ['Clarify payment schedule', 'Review penalty structure'],
      },
      {
        id: '2',
        title: 'Liability Clause',
        riskLevel: 'medium',
        issues: ['Limited liability protection'],
        recommendations: ['Consider adding liability caps'],
      },
    ],
  };

  return (
    <div className="space-y-8">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            Analysis Results
          </h1>
          <p className="mt-2 text-slate-600">
            Detailed analysis for {analysis.documentName}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" leftIcon={<Share2 className="h-4 w-4" />}>
            Share
          </Button>
          <Button leftIcon={<Download className="h-4 w-4" />}>
            Export PDF
          </Button>
        </div>
      </div>

      {}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-semibold text-slate-900">
            Risk Overview
          </h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            analysis.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
            analysis.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
            analysis.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
            'bg-slate-100 text-slate-800'
          }`}>
            {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)} Risk
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {analysis.riskScore}%
            </div>
            <div className="text-sm text-slate-600">Overall Risk Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {analysis.clauses.length}
            </div>
            <div className="text-sm text-slate-600">Clauses Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              2
            </div>
            <div className="text-sm text-slate-600">Issues Found</div>
          </div>
        </div>
      </Card>

      {}
      <Card>
        <h2 className="text-xl font-heading font-semibold text-slate-900 mb-4">
          Executive Summary
        </h2>
        <p className="text-slate-700 leading-relaxed">
          {analysis.summary}
        </p>
      </Card>

      {}
      <Card>
        <h2 className="text-xl font-heading font-semibold text-slate-900 mb-6">
          Clause Analysis
        </h2>

        <div className="space-y-6">
          {analysis.clauses.map((clause) => (
            <div key={clause.id} className="border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-900">
                  {clause.title}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  clause.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                  clause.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
                  clause.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {clause.riskLevel.charAt(0).toUpperCase() + clause.riskLevel.slice(1)} Risk
                </span>
              </div>

              {}
              {clause.issues.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Issues Found
                  </h4>
                  <ul className="space-y-1">
                    {clause.issues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start">
                        <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {}
              {clause.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {clause.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <span className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Next Steps
            </h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Review the identified issues and recommendations</li>
              <li>• Consult with legal counsel for high-risk items</li>
              <li>• Consider negotiating problematic clauses</li>
              <li>• Export the full report for your records</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

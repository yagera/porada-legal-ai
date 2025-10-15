import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { useNotifications } from '@/components/Notification/NotificationProvider';
import { apiClient } from '@/utils/api';

interface AnalysisData {
  analysis_id: string;
  file_id: string;
  filename: string;
  analysis_result: {
    entities: Array<{
      label: string;
      text: string;
      start: number;
      end: number;
      confidence: number;
    }>;
    risk_analysis: {
      level: string;
      confidence: number;
      probabilities: Record<string, number>;
    };
    text: string;
    processing_time: number;
  };
  status: string;
  created_at: string;
  processing_time: number;
}

export function AnalysisResults(): React.ReactElement {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotifications();

  useEffect(() => {
    if (analysisId) {
      loadAnalysis(analysisId);
    }
  }, [analysisId]);

  const loadAnalysis = async (id: string) => {
    try {
      setLoading(true);
      const data = await apiClient.get<AnalysisData>(`/api/analysis/${id}`);
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading analysis:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load analysis results',
      });
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/history')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to History
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/history')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to History
          </Button>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Analysis not found</h3>
          <p className="text-slate-600">The requested analysis could not be found.</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/history')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to History
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            Analysis Results
          </h1>
          <p className="mt-2 text-slate-600">
            Detailed analysis for {analysis.filename}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" leftIcon={<Share2 className="h-4 w-4" />}>
            Share
          </Button>
          <Button leftIcon={<Download className="h-4 w-4" />}>
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold text-slate-900">
                Risk Overview
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.analysis_result.risk_analysis.level)}`}>
                {analysis.analysis_result.risk_analysis.level.charAt(0).toUpperCase() + analysis.analysis_result.risk_analysis.level.slice(1)} Risk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {Math.round(analysis.analysis_result.risk_analysis.confidence * 100)}%
                </div>
                <div className="text-sm text-slate-600">Confidence Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {analysis.analysis_result.entities.length}
                </div>
                <div className="text-sm text-slate-600">Entities Found</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {Math.round(analysis.analysis_result.processing_time * 1000)}ms
                </div>
                <div className="text-sm text-slate-600">Processing Time</div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-heading font-semibold text-slate-900 mb-6">
              Document Text
            </h2>
            <div className="prose max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {analysis.analysis_result.text}
              </p>
            </div>
          </Card>

          {analysis.analysis_result.entities.length > 0 && (
            <Card>
              <h2 className="text-xl font-heading font-semibold text-slate-900 mb-6">
                Extracted Entities
              </h2>
              <div className="space-y-4">
                {analysis.analysis_result.entities.map((entity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                        {entity.label}
                      </span>
                      <span className="text-slate-900 font-medium">{entity.text}</span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {Math.round(entity.confidence * 100)}% confidence
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-heading font-semibold text-slate-900 mb-4">
              Risk Probabilities
            </h3>
            <div className="space-y-3">
              {Object.entries(analysis.analysis_result.risk_analysis.probabilities).map(([level, probability]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 capitalize">
                    {level} Risk
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getRiskColor(level)}`}
                        style={{ width: `${probability * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600 w-12 text-right">
                      {Math.round(probability * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-heading font-semibold text-slate-900 mb-4">
              Analysis Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className="font-medium text-slate-900 capitalize">{analysis.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Created:</span>
                <span className="font-medium text-slate-900">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Processing Time:</span>
                <span className="font-medium text-slate-900">
                  {Math.round(analysis.processing_time * 1000)}ms
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
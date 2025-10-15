import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  AlertTriangle,
  Clock,
  BarChart3,
  Shield
} from 'lucide-react';
import { Card } from '@/components/UI/Card';
import { StatCard } from '@/components/Dashboard/StatCard';
import { RecentAnalyses } from '@/components/Dashboard/RecentAnalyses';
import { RiskOverview } from '@/components/Dashboard/RiskOverview';
import { QuickActions } from '@/components/Dashboard/QuickActions';
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

export function Dashboard(): React.ReactElement {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const { showNotification } = useNotifications();

  useEffect(() => {
    window.scrollTo(0, 0);
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
        message: 'Failed to load dashboard data',
      });
    }
  };

  const stats = {
    totalAnalyses: analyses.length,
    highRiskDocuments: analyses.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length,
    pendingAnalyses: analyses.filter(a => a.status === 'processing').length,
    averageRiskScore: analyses.length > 0 ? Math.round(analyses.reduce((acc, a) => {
      const riskScores = { low: 25, medium: 50, high: 75, critical: 90 };
      return acc + (riskScores[a.risk_level as keyof typeof riskScores] || 0);
    }, 0) / analyses.length) : 0,
  };

  const recentAnalyses = analyses.slice(0, 3).map(analysis => ({
    id: analysis.analysis_id,
    name: analysis.filename,
    status: analysis.status as 'completed' | 'processing' | 'failed',
    riskLevel: analysis.risk_level as 'low' | 'medium' | 'high' | 'critical' | null,
    completedAt: analysis.status === 'completed' ? new Date(analysis.created_at) : null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Welcome back! Here's an overview of your contract analyses.
        </p>
      </div>

      <QuickActions />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Analyses"
          value={stats.totalAnalyses.toString()}
          icon={FileText}
          trend={{ value: 12, direction: 'up' }}
          color="blue"
        />
        <StatCard
          title="High Risk Documents"
          value={stats.highRiskDocuments.toString()}
          icon={AlertTriangle}
          trend={{ value: 25, direction: 'down' }}
          color="red"
        />
        <StatCard
          title="Pending Analyses"
          value={stats.pendingAnalyses.toString()}
          icon={Clock}
          trend={{ value: 0, direction: 'neutral' }}
          color="amber"
        />
        <StatCard
          title="Average Risk Score"
          value={`${stats.averageRiskScore}%`}
          icon={BarChart3}
          trend={{ value: 8, direction: 'down' }}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentAnalyses analyses={recentAnalyses} />
        </div>
        <div>
          <RiskOverview />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Legal Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-medium text-slate-900 mb-2">Contract Review Tips</h3>
            <p className="text-sm text-slate-600">
              Always check for termination clauses, liability limitations, and payment terms when reviewing contracts.
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium text-slate-900 mb-2">Risk Assessment</h3>
            <p className="text-sm text-slate-600">
              Our AI analyzes 15+ risk factors including financial, legal, and operational risks in your documents.
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium text-slate-900 mb-2">Compliance Check</h3>
            <p className="text-sm text-slate-600">
              Ensure your documents comply with current regulations and industry standards.
            </p>
          </Card>
        </div>
      </div>
      <Card className="bg-green-50 border-green-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Secure Analysis Environment
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Your documents are processed in a secure, encrypted environment. 
              All data is protected with enterprise-grade security measures.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

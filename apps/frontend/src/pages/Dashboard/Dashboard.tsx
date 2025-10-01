import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  AlertTriangle,
  Clock,
  BarChart3,
  Shield
} from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { StatCard } from '@/components/Dashboard/StatCard';
import { RecentAnalyses } from '@/components/Dashboard/RecentAnalyses';
import { RiskOverview } from '@/components/Dashboard/RiskOverview';
import { QuickActions } from '@/components/Dashboard/QuickActions';

export function Dashboard(): React.ReactElement {
  const stats = {
    totalAnalyses: 24,
    highRiskDocuments: 3,
    pendingAnalyses: 2,
    averageRiskScore: 35,
  };

  const recentAnalyses = [
    {
      id: '1',
      name: 'Service Agreement.pdf',
      status: 'completed' as const,
      riskLevel: 'medium' as const,
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'Employment Contract.pdf',
      status: 'completed' as const,
      riskLevel: 'high' as const,
      completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: '3',
      name: 'NDA Template.pdf',
      status: 'processing' as const,
      riskLevel: null,
      completedAt: null,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Welcome back! Here's an overview of your contract analyses.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/upload">
            <Button
              size="lg"
              leftIcon={<Upload className="h-5 w-5" />}
            >
              Upload Document
            </Button>
          </Link>
        </div>
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

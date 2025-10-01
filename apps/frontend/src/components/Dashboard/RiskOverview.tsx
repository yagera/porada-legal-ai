import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/UI/Card';
import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { cn } from '@/utils';

export function RiskOverview(): React.ReactElement {

  const riskData = [
    { name: 'Low Risk', value: 45, color: '#38a169' },
    { name: 'Medium Risk', value: 30, color: '#ed8936' },
    { name: 'High Risk', value: 20, color: '#dd6b20' },
    { name: 'Critical Risk', value: 5, color: '#e53e3e' },
  ];

  const riskStats = [
    {
      label: 'Documents Analyzed',
      value: '24',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Critical Issues',
      value: '3',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      label: 'Avg. Risk Score',
      value: '35%',
      icon: Shield,
      color: 'text-blue-600',
    },
    {
      label: 'Pending Review',
      value: '2',
      icon: Clock,
      color: 'text-amber-600',
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-medium">
          <p className="font-medium text-slate-900">{data.name}</p>
          <p className="text-sm text-slate-600">
            {data.value} documents ({((data.value / 100) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-heading font-semibold text-slate-900 mb-2">
          Risk Overview
        </h2>
        <p className="text-slate-600">
          Distribution of risk levels across your documents
        </p>
      </div>

      {}
      <div className="mb-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '16px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="space-y-3">
        {riskStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className={cn('h-4 w-4', stat.color)} />
                <span className="text-sm text-slate-600">{stat.label}</span>
              </div>
              <span className="text-sm font-medium text-slate-900">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-medium text-slate-900 mb-3">
          Risk Level Guide
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-600">Low Risk: Minimal concerns</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-slate-600">Medium Risk: Review recommended</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-slate-600">High Risk: Attention required</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-600">Critical Risk: Immediate action</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

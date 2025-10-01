import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, History, Settings } from 'lucide-react';
import { Card } from '@/components/UI/Card';

export function QuickActions(): React.ReactElement {
  const actions = [
    {
      title: 'Upload Document',
      description: 'Analyze a new contract or agreement',
      icon: Upload,
      href: '/upload',
      variant: 'primary' as const,
      primary: true,
    },
    {
      title: 'View Results',
      description: 'Check latest analysis results',
      icon: FileText,
      href: '/analysis',
      variant: 'outline' as const,
    },
    {
      title: 'Analysis History',
      description: 'Browse previous analyses',
      icon: History,
      href: '/history',
      variant: 'outline' as const,
    },
    {
      title: 'Settings',
      description: 'Manage your preferences',
      icon: Settings,
      href: '/settings',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-heading font-semibold text-slate-900 mb-2">
          Quick Actions
        </h2>
        <p className="text-slate-600">
          Get started with common tasks
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link key={action.title} to={action.href}>
              <div className={`
                group p-4 rounded-lg border-2 border-dashed transition-all duration-200
                ${action.primary 
                  ? 'border-navy-200 bg-navy-50 hover:border-navy-300 hover:bg-navy-100' 
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                }
              `}>
                <div className="text-center">
                  <div className={`
                    inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3
                    ${action.primary 
                      ? 'bg-navy-900 text-white' 
                      : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                    }
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className={`
                    font-medium mb-1
                    ${action.primary ? 'text-navy-900' : 'text-slate-900'}
                  `}>
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

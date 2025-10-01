import React, { useState } from 'react';
import { User, Bell, Shield, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';

export function Settings(): React.ReactElement {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Download },
  ];

  const TabButton = ({ tab, isActive, onClick }: { tab: any; isActive: boolean; onClick: () => void }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{tab.label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      {}
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">
          Settings
        </h1>
        <p className="mt-2 text-slate-600">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {}
        <div className="lg:col-span-1">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </nav>
          </Card>
        </div>

        {}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-xl font-heading font-semibold text-slate-900 mb-6">
                Profile Information
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="German"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Khakov"
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="gera@gmail.com"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    defaultValue="Acme Corporation"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <select className="input w-full">
                    <option>Legal Counsel</option>
                    <option>Contract Manager</option>
                    <option>Business Analyst</option>
                    <option>Executive</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-xl font-heading font-semibold text-slate-900 mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-slate-600">
                        Receive email notifications for analysis completion
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">
                        High Risk Alerts
                      </h3>
                      <p className="text-sm text-slate-600">
                        Get immediate notifications for high-risk findings
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">
                        Weekly Reports
                      </h3>
                      <p className="text-sm text-slate-600">
                        Receive weekly summary reports of your analyses
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h2 className="text-xl font-heading font-semibold text-slate-900 mb-6">
                Security Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    Password
                  </h3>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    Active Sessions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Current Session
                        </p>
                        <p className="text-xs text-slate-600">
                          Chrome on macOS • San Francisco, CA
                        </p>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card>
              <h2 className="text-xl font-heading font-semibold text-slate-900 mb-6">
                Data & Privacy
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    Export Data
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-900">
                        Download all your data
                      </p>
                      <p className="text-xs text-slate-600">
                        Includes all analyses, documents, and account information
                      </p>
                    </div>
                    <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
                      Export Data
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    Delete Account
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="text-sm text-red-900 font-medium">
                        Permanently delete your account
                      </p>
                      <p className="text-xs text-red-700">
                        This action cannot be undone. All your data will be permanently deleted.
                      </p>
                    </div>
                    <Button 
                      variant="danger" 
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

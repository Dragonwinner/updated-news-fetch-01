import React, { useState } from 'react';
import { LayoutDashboard, Users, ArrowLeft } from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';

type AdminView = 'dashboard' | 'users';

interface AdminLayoutProps {
  onBack: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const navItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users' as AdminView, label: 'User Management', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Main
              </button>
              <div className="flex space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        currentView === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Admin Panel
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div>
        {currentView === 'dashboard' && <AdminDashboard />}
        {currentView === 'users' && <UserManagement />}
      </div>
    </div>
  );
};

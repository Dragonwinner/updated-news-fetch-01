import React from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
  lastUpdated: Date | null;
}

export function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">News Domain Generator</h1>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4" />
              <span>Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
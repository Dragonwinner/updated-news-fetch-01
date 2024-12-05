import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useNewsStore } from '../store/useNewsStore';
import { exportToTxt, exportToPdf } from '../services/exportService';
import { formatDistanceToNow } from 'date-fns';

export function NewsControls() {
  const { articles, lastUpdated, fetchArticles } = useNewsStore();

  const handleExport = async (format: 'txt' | 'pdf') => {
    if (format === 'txt') {
      await exportToTxt(articles);
    } else {
      await exportToPdf(articles);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => fetchArticles()}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Now
        </button>
        {lastUpdated && (
          <span className="text-sm text-gray-500">
            Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleExport('txt')}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export TXT
        </button>
        <button
          onClick={() => handleExport('pdf')}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>
    </div>
  );
}
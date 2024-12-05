import React from 'react';
import { useNewsStore } from '../store/useNewsStore';
import { Clock, Globe } from 'lucide-react';

export function NewsSourcesConfig() {
  const { pollingInterval, setPollingInterval, sources, toggleSource } = useNewsStore();

  const intervals = [
    { label: '1 minute', value: 60 * 1000 },
    { label: '5 minutes', value: 5 * 60 * 1000 },
    { label: '15 minutes', value: 15 * 60 * 1000 },
    { label: '30 minutes', value: 30 * 60 * 1000 },
    { label: '1 hour', value: 60 * 60 * 1000 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-500" />
        News Sources Configuration
      </h2>
      
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4" />
          Update Interval
        </label>
        <select
          value={pollingInterval}
          onChange={(e) => setPollingInterval(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {intervals.map((interval) => (
            <option key={interval.value} value={interval.value}>
              {interval.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">News Sources</h3>
        <div className="space-y-2">
          {sources.map((source) => (
            <div key={source.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div>
                <p className="font-medium">{source.name}</p>
                <p className="text-sm text-gray-500">{source.category}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={source.enabled}
                  onChange={() => toggleSource(source.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
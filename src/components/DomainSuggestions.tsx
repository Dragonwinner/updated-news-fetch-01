import React from 'react';
import { DomainSuggestion } from '../types';
import { Check, X } from 'lucide-react';

interface Props {
  suggestions: DomainSuggestion[];
}

export function DomainSuggestions({ suggestions }: Props) {
  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.name}
          className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
        >
          <div>
            <h3 className="font-mono text-lg">{suggestion.name}</h3>
            <div className="flex gap-2 mt-1">
              {suggestion.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {suggestion.available ? (
              <span className="flex items-center gap-1 text-green-500">
                <Check className="w-4 h-4" />
                Available
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500">
                <X className="w-4 h-4" />
                Taken
              </span>
            )}
            <span className="text-sm text-gray-500">
              Score: {Math.round(suggestion.score)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
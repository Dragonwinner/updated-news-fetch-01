import React, { useState } from 'react';
import { useNewsStore } from '../store/useNewsStore';
import { Newspaper, ExternalLink, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export function NewsArticleList() {
  const { articles, isLoading, error } = useNewsStore();
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  const toggleArticle = (id: string) => {
    setExpandedArticles(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => {
        const isExpanded = expandedArticles.has(article.id);
        const publishedDate = new Date(article.publishedAt);
        
        return (
          <div key={article.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-start gap-4">
              <Newspaper className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <a 
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <h3 className="font-semibold text-lg group-hover:text-blue-500 flex items-center gap-2">
                      {article.title}
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </a>
                  <button
                    onClick={() => toggleArticle(article.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-gray-600 mt-1">{article.description}</p>
                {isExpanded && article.content && (
                  <div className="mt-4 text-gray-700 space-y-2">
                    {article.content.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{article.source}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span title={format(publishedDate, 'PPpp')}>
                      {formatDistanceToNow(publishedDate, { addSuffix: true })}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
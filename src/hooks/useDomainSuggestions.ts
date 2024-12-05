import { useState, useEffect, useMemo } from 'react';
import { DomainSuggestion, NewsArticle } from '../types';
import { generateDomainSuggestions } from '../services/domainService';

export function useDomainSuggestions(articles: NewsArticle[]) {
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);

  const keywords = useMemo(() => {
    if (articles.length === 0) return [];

    // Extract keywords from titles and descriptions
    const words = articles.flatMap(article => {
      const titleWords = article.title.split(/\s+/);
      const descWords = article.description.split(/\s+/);
      return [...titleWords, ...descWords];
    });

    // Clean and filter keywords
    return words
      .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(word => {
        // Filter out common words and ensure proper length
        if (word.length < 3 || word.length > 15) return false;
        const commonWords = new Set(['the', 'and', 'for', 'that', 'this', 'with']);
        return !commonWords.has(word);
      });
  }, [articles]);

  useEffect(() => {
    if (keywords.length > 0) {
      setSuggestions(generateDomainSuggestions(keywords));
    }
  }, [keywords]);

  return suggestions;
}
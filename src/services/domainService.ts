import { DomainSuggestion } from '../types';

const TLD_LIST = ['.com', '.io', '.ai', '.app', '.tech'];

function calculateDomainScore(keyword: string): number {
  // Enhanced scoring based on keyword characteristics
  const baseScore = 50;
  const lengthScore = Math.min(keyword.length * 5, 30);
  const hasNumbers = /\d/.test(keyword) ? -10 : 0;
  const isAllLetters = /^[a-zA-Z]+$/.test(keyword) ? 20 : 0;
  const memorabilityScore = keyword.length >= 4 && keyword.length <= 12 ? 15 : 0;
  
  return baseScore + lengthScore + hasNumbers + isAllLetters + memorabilityScore;
}

export function generateDomainSuggestions(keywords: string[]): DomainSuggestion[] {
  const suggestions: Map<string, DomainSuggestion> = new Map();
  const uniqueKeywords = [...new Set(keywords)];

  uniqueKeywords.forEach((keyword) => {
    const cleanKeyword = keyword.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
      
    if (cleanKeyword.length < 3 || cleanKeyword.length > 15) return;

    TLD_LIST.forEach((tld) => {
      const domainName = `${cleanKeyword}${tld}`;
      const score = calculateDomainScore(cleanKeyword);
      
      // Use domain name as key to prevent duplicates
      if (!suggestions.has(domainName)) {
        suggestions.set(domainName, {
          name: domainName,
          available: Math.random() > 0.5, // Simulate availability check
          tld,
          keywords: [keyword],
          score,
        });
      }
    });
  });

  return Array.from(suggestions.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // Limit to top 20 suggestions
}
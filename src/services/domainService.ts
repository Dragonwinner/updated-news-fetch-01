import { DomainSuggestion } from '../types';
import { apiClient } from './apiClient';

let cachedTLDs: string[] | null = null;

export async function getTLDs(): Promise<string[]> {
  if (cachedTLDs) {
    return cachedTLDs;
  }

  try {
    const response = await apiClient.getTLDs();
    cachedTLDs = response.tlds || ['.com', '.io', '.ai', '.app', '.tech'];
    return cachedTLDs;
  } catch (error) {
    console.error('Error fetching TLDs:', error);
    return ['.com', '.io', '.ai', '.app', '.tech'];
  }
}

function calculateDomainScore(keyword: string): number {
  // Enhanced scoring based on keyword characteristics
  const baseScore = 50;
  const lengthScore = Math.min(keyword.length * 5, 30);
  const hasNumbers = /\d/.test(keyword) ? -10 : 0;
  const isAllLetters = /^[a-zA-Z]+$/.test(keyword) ? 20 : 0;
  const memorabilityScore = keyword.length >= 4 && keyword.length <= 12 ? 15 : 0;
  
  return baseScore + lengthScore + hasNumbers + isAllLetters + memorabilityScore;
}

export async function generateDomainSuggestions(keywords: string[]): Promise<DomainSuggestion[]> {
  const suggestions: Map<string, DomainSuggestion> = new Map();
  const uniqueKeywords = [...new Set(keywords)];
  const TLD_LIST = await getTLDs();

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

// Fetch domains from backend API
export async function fetchDomainsFromAPI(filters?: {
  tld?: string;
  available?: boolean;
  minScore?: number;
  limit?: number;
  offset?: number;
}): Promise<DomainSuggestion[]> {
  try {
    const response = await apiClient.getDomains(filters);
    return response.domains.map((domain: {
      name: string;
      tld: string;
      available: boolean;
      keywords: string[];
      score: number;
    }) => ({
      name: `${domain.name}${domain.tld}`,
      available: domain.available,
      tld: domain.tld,
      keywords: domain.keywords,
      score: domain.score,
    }));
  } catch (error) {
    console.error('Error fetching domains from API:', error);
    return [];
  }
}

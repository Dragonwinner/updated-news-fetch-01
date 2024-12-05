import { NewsArticle, NewsSource } from '../types';
import { mockArticles } from './mockData';
import { extractArticleContent } from './articleExtractor';
import { fetchQueue } from './fetchQueue';
import { stripHtml, retryWithBackoff, generateUniqueId } from '../utils/helpers';

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://cors.eu.org/',
];

async function parseXMLToJSON(xmlText: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Try different RSS feed formats
  const items = xmlDoc.querySelectorAll('item, entry');
  
  return Array.from(items).map(item => ({
    title: item.querySelector('title')?.textContent || '',
    description: 
      item.querySelector('description')?.textContent || 
      item.querySelector('summary')?.textContent || '',
    content: 
      item.querySelector('content\\:encoded')?.textContent ||
      item.querySelector('content')?.textContent ||
      item.querySelector('description')?.textContent || '',
    link: 
      item.querySelector('link')?.textContent ||
      item.querySelector('link')?.getAttribute('href') || '',
    guid: 
      item.querySelector('guid')?.textContent ||
      item.querySelector('id')?.textContent || '',
    pubDate: 
      item.querySelector('pubDate')?.textContent ||
      item.querySelector('published')?.textContent ||
      item.querySelector('updated')?.textContent || '',
  }));
}

async function fetchWithFallbackProxy(url: string): Promise<Response> {
  let lastError: Error | null = null;

  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(`${proxy}${encodeURIComponent(url)}`, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      if (response.ok) {
        return response;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error('All CORS proxies failed');
}

async function fetchSingleFeed(source: NewsSource): Promise<NewsArticle[]> {
  try {
    // Queue the fetch request to avoid rate limiting
    const response = await fetchQueue.add(() => 
      retryWithBackoff(() => fetchWithFallbackProxy(source.url))
    );

    const xmlText = await response.text();
    const items = await parseXMLToJSON(xmlText);
    
    // Process items sequentially with rate limiting
    const articles: NewsArticle[] = [];
    
    for (const item of items) {
      try {
        const content = item.content || await fetchQueue.add(() =>
          extractArticleContent(item.link)
        );
        
        articles.push({
          id: item.guid || item.link || generateUniqueId(),
          title: stripHtml(item.title),
          description: stripHtml(item.description),
          content: stripHtml(content),
          url: item.link,
          source: source.name,
          publishedAt: item.pubDate || new Date().toISOString(),
        });
      } catch (error) {
        console.warn(`Failed to process article from ${source.name}:`, error);
        // Continue with next item
      }
    }
    
    return articles;
  } catch (error) {
    console.error(`Error fetching feed ${source.url}:`, error);
    return [];
  }
}

export async function fetchNewsArticles(sources: NewsSource[]): Promise<NewsArticle[]> {
  try {
    const enabledSources = sources.filter(source => source.enabled);
    
    if (enabledSources.length === 0) {
      console.log('No enabled news sources, using mock data');
      return mockArticles;
    }

    const feedPromises = enabledSources.map(source => fetchSingleFeed(source));
    const results = await Promise.allSettled(feedPromises);
    
    const articles = results
      .filter((result): result is PromiseFulfilledResult<NewsArticle[]> => 
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value)
      .sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, 50); // Limit to 50 most recent articles

    if (articles.length === 0) {
      console.log('No articles fetched, using mock data');
      return mockArticles;
    }

    return articles;
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return mockArticles;
  }
}
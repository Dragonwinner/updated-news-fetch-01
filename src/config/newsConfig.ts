import { NewsSource } from '../types';

export const DEFAULT_POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://feeds.feedburner.com/TechCrunch',
    category: 'technology',
    enabled: true,
  },
  {
    id: 'verge',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'technology',
    enabled: true,
  },
  {
    id: 'wired',
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'technology',
    enabled: true,
  },
  {
    id: 'reuters-tech',
    name: 'Reuters Technology',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
    category: 'technology',
    enabled: true,
  },
  {
    id: 'nyt-tech',
    name: 'NYT Technology',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
    category: 'technology',
    enabled: true,
  },
];
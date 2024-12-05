import { create } from 'zustand';
import { NewsArticle, NewsSource } from '../types';
import { fetchNewsArticles } from '../services/newsService';
import { DEFAULT_POLLING_INTERVAL, NEWS_SOURCES } from '../config/newsConfig';

interface NewsStore {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  pollingInterval: number;
  sources: NewsSource[];
  setPollingInterval: (interval: number) => void;
  toggleSource: (sourceId: string) => void;
  fetchArticles: () => Promise<void>;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  articles: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  pollingInterval: DEFAULT_POLLING_INTERVAL,
  sources: NEWS_SOURCES,
  
  setPollingInterval: (interval: number) => {
    set({ pollingInterval: interval });
  },
  
  toggleSource: (sourceId: string) => {
    set(state => ({
      sources: state.sources.map(source => 
        source.id === sourceId 
          ? { ...source, enabled: !source.enabled }
          : source
      )
    }));
  },
  
  fetchArticles: async () => {
    set({ isLoading: true, error: null });
    try {
      const { sources } = get();
      const articles = await fetchNewsArticles(sources);
      set({ 
        articles, 
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch news',
        isLoading: false,
        lastUpdated: new Date(),
      });
    }
  },
}));
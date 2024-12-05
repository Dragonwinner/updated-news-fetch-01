import React from 'react';
import { useNewsPolling } from './hooks/useNewsPolling';
import { useDomainSuggestions } from './hooks/useDomainSuggestions';
import { useNewsStore } from './store/useNewsStore';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';

export default function App() {
  useNewsPolling();
  const { articles, lastUpdated } = useNewsStore();
  const suggestions = useDomainSuggestions(articles);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header lastUpdated={lastUpdated} />
      <MainContent suggestions={suggestions} />
    </div>
  );
}
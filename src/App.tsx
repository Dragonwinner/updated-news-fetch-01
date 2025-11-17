import React, { useEffect, useState } from 'react';
import { useNewsPolling } from './hooks/useNewsPolling';
import { useDomainSuggestions } from './hooks/useDomainSuggestions';
import { useNewsStore } from './store/useNewsStore';
import { useAuthStore } from './store/useAuthStore';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { checkAuth, isAuthenticated } = useAuthStore();
  
  useNewsPolling();
  const { articles, lastUpdated } = useNewsStore();
  const suggestions = useDomainSuggestions(articles);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Close auth modal when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        lastUpdated={lastUpdated} 
        onAuthClick={() => setShowAuthModal(true)}
      />
      <MainContent suggestions={suggestions} />
      {showAuthModal && !isAuthenticated && <AuthModal />}
    </div>
  );
}
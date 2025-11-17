import React, { useEffect, useState } from 'react';
import { useNewsPolling } from './hooks/useNewsPolling';
import { useDomainSuggestions } from './hooks/useDomainSuggestions';
import { useNewsStore } from './store/useNewsStore';
import { useAuthStore } from './store/useAuthStore';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';
import { AuthModal } from './components/AuthModal';
import { AdminLayout } from './components/AdminLayout';

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { checkAuth, isAuthenticated, user } = useAuthStore();
  
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

  // Reset admin panel if user logs out or is not admin
  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      setShowAdminPanel(false);
    }
  }, [isAuthenticated, user]);

  // If admin panel is shown, render only the admin layout
  if (showAdminPanel && isAuthenticated && user?.role === 'admin') {
    return <AdminLayout onBack={() => setShowAdminPanel(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        lastUpdated={lastUpdated} 
        onAuthClick={() => setShowAuthModal(true)}
        onAdminClick={() => setShowAdminPanel(true)}
      />
      <MainContent suggestions={suggestions} />
      {showAuthModal && !isAuthenticated && <AuthModal />}
    </div>
  );
}
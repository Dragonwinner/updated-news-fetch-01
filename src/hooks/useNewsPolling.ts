import { useEffect, useRef, useCallback } from 'react';
import { useNewsStore } from '../store/useNewsStore';

export function useNewsPolling() {
  const { pollingInterval, fetchArticles } = useNewsStore();
  const pollingRef = useRef<number>();

  const poll = useCallback(() => {
    fetchArticles().catch(error => {
      console.error('Polling error:', error);
    });
  }, [fetchArticles]);

  useEffect(() => {
    // Clear existing interval
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
    }

    // Initial fetch
    poll();

    // Set up new polling interval
    pollingRef.current = window.setInterval(poll, pollingInterval);

    // Cleanup
    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, [poll, pollingInterval]); // Re-run effect when polling interval changes
}
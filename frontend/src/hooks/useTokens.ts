import { useState, useEffect } from 'react';
import axios from 'axios';
import { Token } from '../types';

export const useTokens = (walletAddress: string | null) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/tokens`,
          { headers: { 'wallet-address': walletAddress } }
        );
        
        setTokens(response.data);
      } catch (err) {
        setError('Failed to fetch tokens');
        console.error('Token fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [walletAddress]);

  return { tokens, isLoading, error };
}; 
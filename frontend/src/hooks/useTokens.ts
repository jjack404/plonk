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
        console.log('Fetching tokens from backend...');
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/tokens`,
          { 
            headers: { 'wallet-address': walletAddress },
            timeout: 30000 // Increase to 30 seconds
          }
        );
        
        const receivedTokens = response.data;
        console.log(`Received ${receivedTokens.length} tokens:`, {
          nfts: receivedTokens.filter((t: Token) => t.isNFT).length,
          fungible: receivedTokens.filter((t: Token) => !t.isNFT).length
        });
        
        setTokens(receivedTokens);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch tokens';
        console.error('Token fetch error:', {
          error: err,
          walletAddress,
          endpoint: `${import.meta.env.VITE_BACKEND_URL}/api/tokens`
        });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [walletAddress]);

  return { tokens, isLoading, error };
}; 
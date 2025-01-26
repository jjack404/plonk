import { useState, useEffect } from 'react';
import axios from 'axios';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchNFTMetadata } from '../utils/nftMetadata';
import { Token } from '../types';

export function useTokens(walletAddress: string | null) {
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      if (!walletAddress) {
        setTokens([]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch basic token data
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/tokens/${walletAddress}`
        );

        // Enrich NFT metadata
        const enrichedTokens = await Promise.all(
          response.data.map(async (token: Token) => {
            if (token.isNFT) {
              const metadata = await fetchNFTMetadata(connection, token.mint);
              return {
                ...token,
                metadata: metadata || token.metadata,
                logoURI: metadata?.image || token.logoURI
              };
            }
            return token;
          })
        );

        setTokens(enrichedTokens);
      } catch (err) {
        setError('Failed to fetch tokens');
        console.error('Error fetching tokens:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTokens();
  }, [walletAddress, connection]);

  return { tokens, isLoading, error };
} 
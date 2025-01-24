import { Token } from '../types';

export interface EnrichedToken extends Token {
  logoURI?: string;
  symbol: string;
  name?: string;
}

// No need for Jupiter list or enrichment - backend already provides metadata
export const enrichTokenWithMetadata = (token: Token): EnrichedToken => {
  return {
    ...token,
    symbol: token.symbol || 'Unknown',
    logoURI: token.logoURI || `https://placehold.co/32x32?text=${token.symbol || '?'}`
  };
}; 
import React from 'react';
import { Token } from '../../types';
import './PanelStyles.css';

interface NFTGridProps {
  tokens: Token[];
  selectedTokens: {[key: string]: { amount?: number; token: Token }};
  onSelect: (token: Token) => void;
  isLoading: boolean;
  error: string | null;
}

export const NFTGrid: React.FC<NFTGridProps> = ({ 
  tokens, 
  selectedTokens, 
  onSelect, 
  isLoading, 
  error 
}) => {
  const nftTokens = tokens.filter(t => t.isNFT);
  
  if (isLoading) {
    return <div className="token-status-message">Loading NFTs...</div>;
  }

  if (error) {
    return <div className="token-status-message error">{error}</div>;
  }

  if (nftTokens.length === 0) {
    return <div className="token-status-message">No NFTs found in wallet</div>;
  }

  return (
    <div className="tokens-container nft-grid">
      {nftTokens.map(token => (
        <div 
          key={token.mint} 
          className={`inventory-nft-token ${selectedTokens[token.mint] ? 'selected' : ''}`}
          onClick={() => onSelect(token)}
        >
          <div className="nft-image-container">
            <img
              src={token.metadata?.image || token.logoURI || `https://placehold.co/150x150?text=NFT`}
              alt={token.metadata?.name || token.symbol || 'NFT'}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://placehold.co/150x150?text=${token.symbol || 'NFT'}`;
              }}
            />
          </div>
          <div className="nft-info">
            <span className="nft-name">{token.metadata?.name || 'Unnamed NFT'}</span>
            {token.metadata?.description && (
              <span className="nft-description">{token.metadata.description}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 
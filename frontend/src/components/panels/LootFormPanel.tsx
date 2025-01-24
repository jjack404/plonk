import React, { useCallback, useContext, useEffect, useState, FormEvent } from 'react';
import { WalletContext } from '../../context/WalletContext';
import { Token, WalletContextType, MarkerOption } from '../../types';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import axios from 'axios';
import { createDropTransaction } from '../../utils/solanaTransactions';
import { getLocationImage } from '../../utils/locationImage';
import PanoramaView from '../PanoramaView';
import MarkerSelector from '../MarkerSelector';
import './PanelStyles.css';
import { enrichTokenWithMetadata } from '../../utils/tokenUtils';

interface LootFormPanelProps {
  position: { lat: number; lng: number; city?: string; country?: string };
  onSubmit: (data: any) => void;
  setTxStatus: (status: any) => void;
}

export const LootFormPanel: React.FC<LootFormPanelProps> = React.memo(({ 
  position, 
  onSubmit, 
  setTxStatus 
}) => {
  const { walletAddress } = useContext<WalletContextType>(WalletContext);
  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection(import.meta.env.VITE_HELIUS_RPC_URL);
  
  // Form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activeTab, setActiveTab] = useState<'fungible' | 'nft'>('fungible');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [tokenAmounts, setTokenAmounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [locationData, setLocationData] = useState<{
    type: 'panorama' | 'static';
    url?: string;
    location?: { lat: number; lng: number; pano?: string };
  } | null>(null);
  const [markerStyle, setMarkerStyle] = useState<MarkerOption>({
    id: 'pin-cream',
    icon: 'pin',
    color: '#fffbbd'
  });

  // Fetch tokens when wallet changes
  useEffect(() => {
    const fetchTokens = async (): Promise<void> => {
      if (!walletAddress) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get<Token[]>(
          `${import.meta.env.VITE_BACKEND_URL}/api/tokens`,
          { headers: { 'wallet-address': walletAddress } }
        );

        const enrichedTokens = response.data.map(token => enrichTokenWithMetadata(token));
        console.log('Enriched tokens:', enrichedTokens);
        setTokens(enrichedTokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [walletAddress]);

  // Fetch location image
  useEffect(() => {
    if (position) {
      getLocationImage(position).then(setLocationData);
    }
  }, [position]);

  // Token handling
  const handleTokenClick = useCallback((token: Token) => {
    setSelectedTokens(prev => 
      prev.includes(token) 
        ? prev.filter(t => t !== token)
        : [...prev, token]
    );
  }, []);

  const handleAmountChange = useCallback((mint: string, amount: number) => {
    setTokenAmounts(prev => ({
      ...prev,
      [mint]: amount
    }));
  }, []);

  const isAmountValid = useCallback((): boolean => {
    return selectedTokens.every(token => {
      const specifiedAmount = tokenAmounts[token.mint] || 0;
      return token.isNFT 
        ? specifiedAmount === 1
        : (specifiedAmount >= 0.001 && specifiedAmount <= token.amount);
    });
  }, [selectedTokens, tokenAmounts]);

  // Form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (isAmountValid()) {
      setIsConfirming(true);
    }
  };

  // Drop confirmation
  const handleConfirmDrop = async (): Promise<void> => {
    try {
      if (!publicKey || !walletAddress) {
        throw new Error('Wallet not connected');
      }

      const tokensToDrop = selectedTokens.map(token => ({
        token,
        amount: tokenAmounts[token.mint] || token.amount,
      }));

      setTxStatus({ type: 'pending', action: 'drop' });
      
      const transaction = await createDropTransaction(
        publicKey,
        tokensToDrop[0].token,
        tokensToDrop[0].amount
      );

      const signature = await sendTransaction(transaction, connection);
      setTxStatus({ type: 'success', txId: signature, action: 'drop' });

      const dropData = {
        title,
        description,
        tokens: tokensToDrop.map(({ token, amount }) => ({
          ...token,
          amount
        })),
        position,
        walletAddress,
        markerStyle
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/drops`,
        dropData,
        { headers: { 'wallet-address': walletAddress } }
      );

      await connection.confirmTransaction(signature);

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/drops/${response.data._id}/transaction`,
        { txId: signature },
        { headers: { 'wallet-address': walletAddress } }
      );

      onSubmit({
        ...dropData,
        _id: response.data._id,
        txId: signature
      });

    } catch (error) {
      console.error('Error confirming drop:', error);
      setTxStatus({ type: 'error', action: 'drop' });
    }
  };

  // Utility functions
  const fungibleTokens = tokens.filter(token => !token.isNFT);
  const nfts = tokens.filter(token => token.isNFT);

  const abbreviateAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  const isFormValid = () => {
    return (
      title.trim().length > 0 && 
      selectedTokens.length > 0 && 
      selectedTokens.every(token => 
        token.isNFT || 
        (tokenAmounts[token.mint] && tokenAmounts[token.mint] > 0)
      )
    );
  };

  return (
    <div className="panel-section">
      {!isConfirming ? (
        <form onSubmit={handleSubmit}>
          <div className="location-info">
            <div className="location-name">
              {position.city && position.country 
                ? `${position.city}, ${position.country}`
                : position.country || 'Unknown Location'}
            </div>
            <div className="coordinates-row">
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </div>
          </div>
          
          <div className="location-image">
            {locationData?.type === 'panorama' && locationData.location ? (
              <PanoramaView 
                position={locationData.location}
                onError={() => setLocationData({ 
                 type: 'static', 
url: `https://maps.googleapis.com/maps/api/staticmap?center=${position.lat},${position.lng}&zoom=14&size=600x300&scale=2&markers=color:red%7C${position.lat},${position.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
                })}
              />
            ) : (
              <img 
                src={locationData?.url} 
                alt="Location"
              />
            )}
          </div>

          <div className="form-fields">
            <div className="form-field">
              <label>Title <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Enter a title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <div className="form-field">
              <label>Description (optional)</label>
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={280}
              />
            </div>
          </div>

          <div className="inventory-section">
            <div className="token-tab-buttons">
              <button
                className={`token-tab-button ${activeTab === 'fungible' ? 'active-fungible' : ''}`}
                onClick={() => setActiveTab('fungible')}
              >
                Fungible Tokens
              </button>
              <button
                className={`token-tab-button ${activeTab === 'nft' ? 'active-nft' : ''}`}
                onClick={() => setActiveTab('nft')}
              >
                NFTs
              </button>
            </div>
            <div className={`tokens-container ${activeTab === 'nft' ? 'nft-grid' : 'fungible-list'}`}>
              {isLoading ? (
                <div className="tokens-loading">
                  <div className="loader"></div>
                  <span>Fetching {activeTab === 'fungible' ? 'tokens' : 'NFTs'}...</span>
                </div>
              ) : activeTab === 'fungible' ? (
                fungibleTokens.length > 0 ? (
                  fungibleTokens.map((token) => (
                    <div
                      key={token.mint}
                      className={`inventory-fungible-token ${selectedTokens.includes(token) ? 'selected' : ''}`}
                      onClick={() => handleTokenClick(token)}
                    >
                      <div className="token-image-symbol-address">
                        <div className="token-image-symbol">
                          <img
                            src={token.logoURI || `https://placehold.co/32x32?text=${token.symbol}`}
                            alt={token.symbol}
                          />
                          <span className="token-symbol">{token.symbol}</span>
                        </div>
                      </div>
                      <div className="fungible-balance-input-wrap">
                        <span className="inventory-fungible-balance">
                          {token.amount}
                        </span>
                        {selectedTokens.includes(token) && (
                          <div className="inventory-fungible-input-wrap">
                            <input
                              type="number"
                              className="fungible-input"
                              value={tokenAmounts[token.mint] || ''}
                              onChange={(e) => handleAmountChange(token.mint, parseFloat(e.target.value))}
                              onKeyDown={preventNegativeInput}
                              min="0.001"
                              step="0.001"
                              max={token.amount}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-tokens-message">
                    No tokens found in wallet
                  </div>
                )
              ) : (
                nfts.length > 0 ? (
                  nfts.map((token) => (
                    <div
                      key={token.mint}
                      className={`inventory-nft-token ${selectedTokens.includes(token) ? 'selected' : ''}`}
                      onClick={() => handleTokenClick(token)}
                    >
                      <img
                        src={token.metadata?.image || token.uri || token.logoURI}
                        alt={token.metadata?.name || 'NFT'}
                        onError={(e) => {
                          console.log('Image load failed for NFT:', {
                            mint: token.mint,
                            metadata: token.metadata,
                            uri: token.uri,
                            logoURI: token.logoURI
                          });
                          e.currentTarget.src = `https://placehold.co/84x84?text=NFT`;
                        }}
                      />
                      <div className="nft-info">
                        <div className="nft-name">{token.metadata?.name || 'Unnamed NFT'}</div>
                        <div className="token-address">{abbreviateAddress(token.mint)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-tokens-message">
                    No NFTs found in wallet
                  </div>
                )
              )}
            </div>
          </div>
          <button
            type="submit"
            className="drop-button"
            disabled={!isFormValid()}
            onClick={handleConfirmDrop}
          >
            Drop Loot
          </button>
        </form>
      ) : (
        <div className="confirm-view">
          <h3>Confirm Drop</h3>
          <div className="token-list">
            {selectedTokens.map((token, index) => (
              <div key={index} className="token-list-item">
                <div className="token-info">
                  <img
                    src={token.logoURI || `https://placehold.co/32x32?text=${token.symbol}`}
                    alt={token.symbol}
                    className="token-list-image"
                  />
                  <span>{token.symbol}</span>
                </div>
                <span className="token-amount">{tokenAmounts[token.mint] || token.amount}</span>
              </div>
            ))}
          </div>
          <div className="warning-text">
            Warning: Drops are irreversible once confirmed
          </div>
          <div className="marker-selector-container">
            <MarkerSelector 
              value={markerStyle}
              onChange={setMarkerStyle}
            />
          </div>
          <div className="confirm-buttons">
            <button 
              className="confirm-button"
              onClick={handleConfirmDrop}
            >
              Confirm Drop
            </button>
            <button 
              className="back-button"
              onClick={() => setIsConfirming(false)}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.position.lat === nextProps.position.lat &&
    prevProps.position.lng === nextProps.position.lng
  );
});
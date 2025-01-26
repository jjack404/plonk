import React, { useContext, useEffect, useState, FormEvent } from 'react';
import { WalletContext } from '../../context/WalletContext';
import { WalletContextType, MarkerOption, Token } from '../../types';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import axios from 'axios';
import { createDropTransaction } from '../../utils/solanaTransactions';
import PanoramaView from '../PanoramaView';
import MarkerSelector from '../MarkerSelector';
import './PanelStyles.css';
import { useTokens } from '../../hooks/useTokens';
import MiniMap from '../MiniMap';
import { formatLocation } from '../../utils/formatLocation';

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
  const { walletAddress } = useContext(WalletContext) as WalletContextType;
  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  
  // Form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'fungible' | 'nft'>('fungible');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [markerStyle, setMarkerStyle] = useState<MarkerOption>({
    id: 'pin-cream',
    icon: 'pin',
    color: 'var(--manilla)'
  });

  // Token state
  const { tokens, isLoading, error } = useTokens(walletAddress);

  // Add these after other state declarations
  const [selectedTokens, setSelectedTokens] = useState<{
    [key: string]: { amount?: number; token: Token }
  }>({});

  const [useStreetView, setUseStreetView] = useState<boolean>(true);
  
  useEffect(() => {
    // Check for street view availability
    const sv = new google.maps.StreetViewService();
    sv.getPanorama({
      location: { lat: position.lat, lng: position.lng },
      radius: 80, // About 0.05 miles in meters
      source: google.maps.StreetViewSource.OUTDOOR
    }).then(
      () => setUseStreetView(true),
      () => setUseStreetView(false)
    );
  }, [position]);

  // Form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setIsConfirming(true);
  };

  // Drop confirmation
  const handleConfirmDrop = async (): Promise<void> => {
    try {
      if (!publicKey || !walletAddress) {
        setTxStatus({ 
          type: 'error', 
          action: 'drop',
          message: 'Wallet not connected'
        });
        return;
      }

      setTxStatus({ 
        type: 'pending', 
        action: 'drop',
        message: 'Creating transaction...' 
      });

      const selectedTokenArray = Object.values(selectedTokens).map(({ token, amount }) => ({
        token,
        amount: amount || token.amount
      }));

      // Create transaction
      let transaction;
      try {
        transaction = await createDropTransaction(
          publicKey,
          selectedTokenArray
        );
      } catch (error) {
        setTxStatus({ 
          type: 'error', 
          action: 'drop',
          message: 'Failed to create transaction'
        });
        throw error;
      }

      setTxStatus({ 
        type: 'pending', 
        action: 'drop',
        message: 'Please approve the transaction in your wallet' 
      });

      try {
        // Send and confirm transaction first
        const signature = await sendTransaction(transaction, connection);

        setTxStatus({ 
          type: 'pending', 
          action: 'drop',
          message: 'Confirming transaction...',
          txId: signature 
        });

        // Wait for confirmation before creating drop in database
        await connection.confirmTransaction(signature, 'confirmed');

        // Only create drop in database after successful transaction
        const dropData = {
          title,
          description,
          position,
          walletAddress,
          markerStyle,
          tokens: selectedTokenArray.map(({ token, amount }) => ({
            mint: token.mint,
            amount: amount,
            decimals: token.decimals,
            symbol: token.symbol,
            logoURI: token.logoURI,
            metadata: token.metadata,
            isNFT: token.isNFT || false
          })),
          status: 'Active',
          txId: signature
        };

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/drops`,
          dropData,
          { headers: { 'wallet-address': walletAddress } }
        );

        setTxStatus({ 
          type: 'success', 
          action: 'drop',
          message: 'Drop created successfully!',
          txId: signature 
        });

        onSubmit(response.data);

      } catch (txError) {
        console.error('Transaction error:', txError);
        setTxStatus({ 
          type: 'error', 
          action: 'drop',
          message: txError instanceof Error 
            ? txError.message 
            : 'Transaction failed or was rejected'
        });
        throw txError;
      }
    } catch (error) {
      console.error('Drop error:', error);
      setTxStatus({ 
        type: 'error', 
        action: 'drop',
        message: error instanceof Error 
          ? error.message 
          : 'Failed to create drop'
      });
    }
  };

  // Utility functions
  const isFormValid = (): boolean => {
    const hasSelectedTokens = Object.keys(selectedTokens).length > 0;
    const allFungiblesHaveValidAmounts = Object.values(selectedTokens).every(
      ({ amount, token }) => !token.isNFT ? (amount && amount >= 0.0001) : true
    );
    return title.trim().length > 0 && hasSelectedTokens && allFungiblesHaveValidAmounts;
  };

  // Add these handler functions
  const handleTokenSelect = (token: Token) => {
    setSelectedTokens(prev => {
      if (prev[token.mint]) {
        const { [token.mint]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [token.mint]: { token, amount: token.isNFT ? undefined : 0.0001 }
      };
    });
  };

  const handleAmountChange = (mint: string, amount: number) => {
    setSelectedTokens(prev => ({
      ...prev,
      [mint]: { ...prev[mint], amount }
    }));
  };

  return (
    <div className="form-container">
      <div className="form-scroll-area">
        {!isConfirming ? (
          <>
            <form onSubmit={handleSubmit}>
              <div className="location-info">
                <span className="location-name">
                  {formatLocation(position.city, position.country) || 'Unknown Location'}
                </span>
                <div className="coordinates-row">
                  <span>
                    <span className="coordinate-label">lat:</span>
                    {position.lat.toFixed(4)}
                  </span>
                  <span>
                    <span className="coordinate-label">lng:</span>
                    {position.lng.toFixed(4)}
                  </span>
                </div>
              </div>
              
              <div className="location-image">
                {useStreetView ? (
                  <PanoramaView 
                    position={position}
                    onError={() => setUseStreetView(false)}
                  />
                ) : (
                  <MiniMap position={position} />
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
                    type="button"
                    className={`token-tab-button ${activeTab === 'fungible' ? 'active-fungible' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('fungible');
                    }}
                  >
                    Fungible Tokens
                  </button>
                  <button
                    type="button"
                    className={`token-tab-button ${activeTab === 'nft' ? 'active-nft' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('nft');
                    }}
                  >
                    NFTs
                  </button>
                </div>
                <div className={`tokens-container ${activeTab === 'nft' ? 'nft-grid' : 'fungible-list'}`}>
                  {activeTab === 'fungible' ? (
                    isLoading ? (
                      <div className="token-status-message">Loading tokens...</div>
                    ) : error ? (
                      <div className="token-status-message error">{error}</div>
                    ) : tokens.filter(t => !t.isNFT).length > 0 ? (
                      tokens.filter(t => !t.isNFT).map(token => (
                        <div 
                          key={token.mint} 
                          className={`inventory-fungible-token ${selectedTokens[token.mint] ? 'selected' : ''}`}
                          onClick={() => handleTokenSelect(token)}
                        >
                          <div className="token-image-symbol">
                            <img
                              src={token.logoURI || `https://placehold.co/32x32?text=${token.symbol}`}
                              alt={token.symbol}
                            />
                            <span className="token-symbol">{token.symbol}</span>
                          </div>
                          <div className="inventory-fungible-balance">
                            {selectedTokens[token.mint] ? (
                              <input
                                type="number"
                                value={selectedTokens[token.mint].amount}
                                onChange={(e) => handleAmountChange(token.mint, parseFloat(e.target.value))}
                                min={0.0001}
                                max={token.amount}
                                step={0.0001}
                                onClick={(e) => e.stopPropagation()}
                                className="token-amount-input"
                              />
                            ) : (
                              `${token.amount.toFixed(token.decimals)} ${token.symbol}`
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="token-status-message">No tokens found in wallet</div>
                    )
                  ) : (
                    isLoading ? (
                      <div className="token-status-message">Loading NFTs...</div>
                    ) : error ? (
                      <div className="token-status-message error">{error}</div>
                    ) : tokens.filter(t => t.isNFT).length > 0 ? (
                      tokens.filter(t => t.isNFT).map(token => (
                        <div 
                          key={token.mint} 
                          className={`inventory-nft-token ${selectedTokens[token.mint] ? 'selected' : ''}`}
                          onClick={() => handleTokenSelect(token)}
                        >
                          <div className="nft-image-container">
                            <img
                              src={token.logoURI || `https://placehold.co/150x150?text=NFT`}
                              alt={token.symbol}
                            />
                          </div>
                          <div className="nft-info">
                            <span className="nft-name">{token.metadata?.name || 'Unnamed NFT'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="token-status-message">No NFTs found in wallet</div>
                    )
                  )}
                </div>
              </div>
            </form>
            <button
              type="submit"
              className="continue-button"
              disabled={!isFormValid()}
              onClick={(e) => {
                e.preventDefault();
                setIsConfirming(true);
              }}
            >
              Continue
            </button>
          </>
        ) : (
          <div className="confirm-view">
            <div className="confirm-content">
              <div className="confirm-summary">
                <div className="confirm-location">
                  <span className="label">Location:</span>
                  <span>{formatLocation(position.city, position.country) || 'Unknown Location'}</span>
                </div>
                
                <div className="confirm-title">
                  <span className="label">Title:</span>
                  <span>{title}</span>
                </div>
                
                {description && (
                  <div className="confirm-description">
                    <span className="label">Description:</span>
                    <span>{description}</span>
                  </div>
                )}

                <div className="selected-tokens-container">
                  <span className="label">Selected Tokens:</span>
                  <div className="selected-tokens-scroll">
                    {Object.values(selectedTokens)
                      .filter(({ token }) => !token.isNFT)
                      .map(({ token, amount }) => (
                        <div key={token.mint} className="selected-token-item fungible">
                          <img 
                            src={token.logoURI || `https://placehold.co/32x32?text=${token.symbol}`}
                            alt={token.symbol}
                          />
                          <span className="token-details">
                            <span className="token-symbol">{token.symbol}</span>
                            <span className="token-amount">{amount} {token.symbol}</span>
                          </span>
                        </div>
                      ))}
                    
                    {Object.values(selectedTokens)
                      .filter(({ token }) => token.isNFT)
                      .map(({ token }) => (
                        <div key={token.mint} className="selected-token-item nft">
                          <img 
                            src={token.logoURI || `https://placehold.co/50x50?text=NFT`}
                            alt={token.metadata?.name || 'NFT'}
                          />
                          <span className="token-details">
                            <span className="token-name">{token.metadata?.name || 'Unnamed NFT'}</span>
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="marker-selector-wrap">
                  
                  <MarkerSelector 
                    value={markerStyle}
                    onChange={setMarkerStyle}
                    small
                  />
                </div>
              </div>
            </div>

            <div className="confirm-footer">
              <div className="warning-text">
                Warning: Drops are irreversible once confirmed
              </div>
              
              <div className="confirm-buttons">
                <button 
                  className="back-button"
                  onClick={() => setIsConfirming(false)}
                >
                  Back
                </button>
                <button 
                  className="confirm-button"
                  onClick={handleConfirmDrop}
                >
                  Confirm Drop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.position.lat === nextProps.position.lat &&
    prevProps.position.lng === nextProps.position.lng
  );
});
import React, { useState, useEffect, useContext, FormEvent, KeyboardEvent, ChangeEvent } from 'react';
import { WalletContext } from '../context/WalletContext';
import { LootFormProps, Token, WalletContextType } from '../types';
import axios from 'axios';
import './LootForm.css';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createDropTransaction } from '../utils/solanaTransactions';
import { getLocationImage } from '../utils/locationImage';
import PanoramaView from './PanoramaView';

const LootForm: React.FC<LootFormProps> = ({ position, onClose, onSubmit, setTxStatus }) => {
  const { walletAddress } = useContext<WalletContextType>(WalletContext);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activeTab, setActiveTab] = useState<'fungible' | 'nft'>('fungible');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [tokenAmounts, setTokenAmounts] = useState<Record<string, number>>({});
  const [locationData, setLocationData] = useState<{
    type: 'panorama' | 'static';
    url?: string;
    location?: { lat: number; lng: number; pano?: string };
  } | null>(null);

  useEffect(() => {
    const fetchTokens = async (): Promise<void> => {
      try {
        const response = await axios.get<Token[]>(`${import.meta.env.VITE_BACKEND_URL}/api/tokens`, {
          headers: { 'wallet-address': walletAddress },
        });
        setTokens(response.data);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    if (walletAddress) {
      fetchTokens();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (position) {
      getLocationImage(position).then(data => {
        setLocationData(data);
      });
    }
  }, [position]);

  const handleTokenClick = (token: Token): void => {
    setSelectedTokens((prevSelectedTokens) => {
      if (prevSelectedTokens.includes(token)) {
        return prevSelectedTokens.filter((t) => t !== token);
      } else {
        return [...prevSelectedTokens, token];
      }
    });
  };

  const handleAmountChange = (token: Token, amount: string): void => {
    let parsedAmount = parseFloat(amount);
    
    // Handle empty or invalid input
    if (isNaN(parsedAmount)) {
      parsedAmount = 0;
    }
    
    // For NFTs, ensure whole numbers
    if (token.isNFT) {
      parsedAmount = Math.floor(parsedAmount);
    }
    
    setTokenAmounts((prevAmounts) => ({
      ...prevAmounts,
      [token.mint]: parsedAmount,
    }));
  };

  const isAmountValid = (): boolean => {
    return selectedTokens.every(token => {
      const specifiedAmount = tokenAmounts[token.mint] || 0;
      if (token.isNFT) {
        return specifiedAmount === 1;
      }
      return specifiedAmount >= 0.001 && specifiedAmount <= token.amount;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (isAmountValid()) {
      setIsConfirming(true);
    }
  };

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
      
      // Create and send transaction
      const transaction = await createDropTransaction(
        publicKey,
        tokensToDrop[0].token,
        tokensToDrop[0].amount
      );

      const signature = await sendTransaction(transaction, connection);
      setTxStatus({ type: 'success', txId: signature, action: 'drop' });

      // Save drop to database
      const dropData = {
        title,
        description,
        tokens: tokensToDrop.map(({ token, amount }) => ({
          ...token,
          amount
        })),
        position,
        walletAddress
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/drops`,
        dropData,
        {
          headers: { 'wallet-address': walletAddress }
        }
      );

      // Wait for confirmation
      await connection.confirmTransaction(signature);

      // Update drop with transaction ID
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/drops/${response.data._id}/transaction`,
        { txId: signature },
        {
          headers: { 'wallet-address': walletAddress }
        }
      );

      setTxStatus({ type: 'success', txId: signature, action: 'drop' });
      
      // Call onSubmit with the created drop data
      onSubmit({
        ...dropData,
        _id: response.data._id,
        txId: signature
      });

      setTimeout(() => {
        setTxStatus(null);
        setIsConfirming(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error confirming drop:', error);
      setTxStatus(null);
    }
  };

  const fungibleTokens = tokens.filter(token => !token.isNFT);
  const nfts = tokens.filter(token => token.isNFT);

  const abbreviateAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const preventNegativeInput = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  return (
    <div className="loot-form">
      <div className="loot-form-header">
        <h2>{isConfirming ? title : 'Drop Loot'}</h2>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>
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
              url: `https://maps.googleapis.com/maps/api/staticmap?center=${position.lat},${position.lng}&zoom=14&size=300x150&markers=color:red%7C${position.lat},${position.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            })}
          />
        ) : (
          <img src={locationData?.url} alt="Drop location" />
        )}
      </div>
      {isConfirming ? (
        <div className="confirmation-view">
          <ul className="token-list">
            {selectedTokens.map((token, index) => (
              <li key={index} className="token-list-item">
                <div className="token-info">
                  <img
                    src={token.logoURI || `https://placehold.co/32x32?text=${token.symbol}`}
                    alt={token.symbol}
                    className="token-list-image"
                  />
                  <span>{token.symbol}</span>
                </div>
                <span className="token-amount">{tokenAmounts[token.mint] || token.amount}</span>
              </li>
            ))}
          </ul>
          <div className="warning-button-wrapper">
            <div className="warning-text">
              Warning: Drops are irreversible once confirmed
            </div>
            <button className="confirm-button" onClick={handleConfirmDrop}>
              Confirm Drop
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-container">
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                className="title-input"
                required
              />
            </div>
            <div className="form-group desc-group">
              <label>Description:</label>
              <textarea
                value={description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                className="description-input"
                required
              />
            </div>
            <div className="form-inventory">
              <div className="tabs">
                <button
                  type="button"
                  className={activeTab === 'fungible' ? 'active' : ''}
                  onClick={() => setActiveTab('fungible')}
                >
                  Fungible Tokens
                </button>
                <button
                  type="button"
                  className={activeTab === 'nft' ? 'active' : ''}
                  onClick={() => setActiveTab('nft')}
                >
                  NFTs
                </button>
              </div>
              <div className="tokens-container">
                {activeTab === 'fungible'
                  ? fungibleTokens.map((token) => (
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
                            Balance: {token.amount}
                          </span>
                          {selectedTokens.includes(token) && (
                            <div className="inventory-fungible-input-wrap">
                              <input
                                type="number"
                                className="fungible-input"
                                value={tokenAmounts[token.mint] || ''}
                                onChange={(e) => handleAmountChange(token, e.target.value)}
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
                  : nfts.map((token) => (
                      <div
                        key={token.mint}
                        className={`inventory-nft-token ${selectedTokens.includes(token) ? 'selected' : ''}`}
                        onClick={() => handleTokenClick(token)}
                      >
                        <img
                          src={token.metadata?.image || `https://placehold.co/84x84?text=${token.symbol}`}
                          alt={token.metadata?.name || token.symbol}
                        />
                        <div className="token-address">{abbreviateAddress(token.mint)}</div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="drop-button"
            disabled={selectedTokens.length === 0 || !isAmountValid()}
          >
            Drop
          </button>
        </form>
      )}
    </div>
  );
};

export default LootForm;

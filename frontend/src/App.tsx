import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Map from './components/Map';
import { WalletProviderWrapper, WalletContext } from './context/WalletContext';
import UserProfile from './components/UserProfile';
import { WalletContextType, TransactionStatus } from './types';
import './App.css';
import Notification from './components/Notification';
import { DropsProvider } from './context/DropsContext';

const App: React.FC = () => {
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);

  const handleProfileClick = (): void => {
    setShowProfile(!showProfile);
  };

  const handleCloseProfile = (): void => {
    setShowProfile(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '-' || e.key === '=') {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <WalletProviderWrapper>
      <DropsProvider>
        <div className="app-container">
          <NavBar onProfileClick={handleProfileClick} />
          <div className="map-wrapper">
            <Map setTxStatus={setTxStatus} />
          </div>
          <WalletContext.Consumer>
            {({ walletAddress, profile }: WalletContextType) => (
              showProfile && (
                <div className="self-profile">
                  <UserProfile walletAddress={walletAddress} profile={profile} onClose={handleCloseProfile} />
                </div>
              )
            )}
          </WalletContext.Consumer>
          {txStatus && (
            <Notification 
              type={txStatus.type}
              txId={txStatus.txId}
              message={txStatus.action === 'drop' ? 'Dropping loot...' : 'Claiming loot...'}
              onClose={() => setTxStatus(null)}
            />
          )}
        </div>
      </DropsProvider>
    </WalletProviderWrapper>
  );
};

export default App;

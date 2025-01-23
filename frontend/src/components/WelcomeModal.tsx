import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './WelcomeModal.css';

const WelcomeModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { select, wallets } = useWallet();

  if (!isVisible) return null;

  const connectSolflare = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const solflareWallet = wallets.find(w => w.adapter.name === 'Solflare');
    
    if (solflareWallet) {
      if (isMobile) {
        // On mobile, use deep linking
        window.location.href = 'https://solflare.com/ul/v1/connect';
      } else {
        // On desktop, use normal connection
        select(solflareWallet.adapter.name);
      }
      setIsVisible(false);
    }
  };

  return (
    <div className="welcome-modal">
      <div className="welcome-content">
        <h3>Welcome to the Plonk alpha release!</h3>
        <p>Get ready to experience the ultimate web3 scavenger hunt.</p>
        <p>To get started, connect your wallet, navigate to a drop location, enable your devices location services, and claim your loot!</p>
        <p className="disclaimer">⚠️ During this alpha test, drops can only be claimed using Solflare wallet.</p>
        <div className="wallet-buttons">
          <button 
            className="wallet-button solflare"
            onClick={connectSolflare}
          >
            <img 
              src="/icons/solflare-logo.jpg" 
              alt="Solflare" 
              width="24" 
              height="24"
            />
            Connect with Solflare
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal; 
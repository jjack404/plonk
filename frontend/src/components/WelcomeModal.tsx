import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PiWalletDuotone, PiMapPinDuotone, PiGiftDuotone, PiWarningDuotone } from "react-icons/pi";
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
        window.location.href = 'https://solflare.com/ul/v1/connect';
      } else {
        select(solflareWallet.adapter.name);
      }
      setIsVisible(false);
    }
  };

  return (
    <div className="welcome-modal">
      <div className="welcome-content">
        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'row', width: '100%', justifyContent: 'center', gap: '12px' }}>
          <h3 style={{marginTop: '.5em'}}>PLONK</h3>
          <span className="alpha"> alpha test</span>
        </div>
        <div className="header-divider"></div>
        <p className="welcome-intro">Get ready to experience the ultimate web3 scavenger hunt!</p>
        <div className="steps">
          <div className="step">
            <span className="step-icon"><PiWalletDuotone /></span>
            <span className="step-text">Connect with Solflare wallet</span>
          </div>
          <div className="step">
            <span className="step-icon"><PiMapPinDuotone /></span>
            <span className="step-text">Enable location services in your browser</span>
          </div>
          <div className="step">
            <span className="step-icon"><PiGiftDuotone /></span>
            <span className="step-text">Find and claim Plonk loot!</span>
          </div>
        </div>
        <div className="disclaimer"><div><PiWarningDuotone /></div><span>During this alpha test, drops can only be claimed using Solflare wallet.</span></div>
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
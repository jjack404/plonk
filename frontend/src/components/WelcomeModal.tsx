import React, { useState } from 'react';
import './WelcomeModal.css';

const WelcomeModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="welcome-modal">
      <div className="welcome-content">
        <h3>Welcome to the Plonk alpha release!</h3>
        <p>Get ready to experience the ultimate web3 scavenger hunt.</p>
        <p>To get started, connect your wallet, navigate to a drop location, enable your devices location services, and claim your loot!</p>
        <button 
          className="continue-button"
          onClick={() => setIsVisible(false)}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal; 
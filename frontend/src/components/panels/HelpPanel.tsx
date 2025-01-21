import React from 'react';
import './PanelStyles.css';

export const HelpPanel: React.FC = () => {
  return (
    <div className="panel-section">
      <h3>Help & FAQ</h3>
      <div className="help-content">
        <h4>How to Play</h4>
        <p>1. Connect your wallet</p>
        <p>2. Find drops on the map</p>
        <p>3. Get within range of drop location</p>
        <p>4. Claim your loot!</p>
        
        <h4>Common Issues</h4>
        <p>• Location not working? Enable location services in your browser</p>
        <p>• Can't claim? Make sure you're within range and have your wallet connected</p>
        <p>• Missing drops? Try refreshing the page</p>
      </div>
    </div>
  );
}; 
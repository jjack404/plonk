import React, { useContext } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletContext } from '../context/WalletContext';
import { NavBarProps } from '../types';
import { PiWalletDuotone, PiUserSquareDuotone } from "react-icons/pi";
import './NavBar.css';

const NavBar: React.FC<NavBarProps> = ({ onProfileClick }) => {
  const { walletAddress } = useContext(WalletContext);

  return (
    <nav className="navbar">
      <div className="logo">
        <h1>PLONK</h1>
      </div>
      <div className="walletButton">
        {walletAddress && (
          <button className="dashboard-button" onClick={onProfileClick}>
            <PiUserSquareDuotone className="profile-icon" />
          </button>
        )}
        <div className="wallet-button-wrapper">
          {!walletAddress && <PiWalletDuotone className="wallet-icon" />}
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

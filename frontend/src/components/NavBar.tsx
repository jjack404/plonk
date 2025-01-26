import React, { useContext } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletContext } from '../context/WalletContext';
import { PiWalletDuotone, PiUserSquareDuotone } from "react-icons/pi";
import { useModal } from '../context/ModalContext';
import './NavBar.css';

const NavBar: React.FC = () => {
  const { walletAddress } = useContext(WalletContext);
  const { openModal } = useModal();

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/plonk-logo-sm.png" alt="" className="logo-small" />
        <h1>PLONK</h1>
        <img src="/plonk-logo-main.png" alt="Plonk" className="logo-large" />
      </div>
      <div className="walletButton">
        {walletAddress && (
          <button className="dashboard-button" onClick={() => openModal('profile')}>
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

import React, { useContext } from 'react';
import NavBar from './components/NavBar';
import Map from './components/Map';
import { WalletProviderWrapper, WalletContext } from './context/WalletContext';
import UserProfile from './components/UserProfile';
import './App.css';
import { DropsProvider } from './context/DropsContext';
import { ModalProvider, useModal } from './context/ModalContext';

const AppContent: React.FC = () => {
  const { activeModal, closeModal } = useModal();
  const { walletAddress, profile } = useContext(WalletContext);

  return (
    <div className="app-container">
      <NavBar />
      <div className="map-wrapper">
        <Map setTxStatus={() => {}} />
      </div>
      {activeModal === 'profile' && (
        <div className="self-profile">
          <UserProfile 
            walletAddress={walletAddress} 
            profile={profile} 
            onClose={closeModal}
          />
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <WalletProviderWrapper>
      <DropsProvider>
        <ModalProvider>
          <AppContent />
        </ModalProvider>
      </DropsProvider>
    </WalletProviderWrapper>
  );
};

export default App;
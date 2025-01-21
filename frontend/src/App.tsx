import React, { useContext } from 'react';
import NavBar from './components/NavBar';
import Map from './components/Map';
import { WalletProviderWrapper, WalletContext } from './context/WalletContext';
import UserProfile from './components/UserProfile';
import './App.css';
import { DropsProvider } from './context/DropsContext';
import { ModalProvider, useModal } from './context/ModalContext';
import { PanelProvider, usePanel } from './context/PanelContext';
import SidePanel from './components/SidePanel';
import PanelContent from './components/PanelContent';
import BottomBar from './components/BottomBar';

const AppContent: React.FC = () => {
  const { activeModal, closeModal } = useModal();
  const { walletAddress, profile } = useContext(WalletContext);
  const { activePanel, setActivePanel } = usePanel();

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
      <SidePanel
        isOpen={!!activePanel}
        onClose={() => setActivePanel(null)}
        title={activePanel ? activePanel.charAt(0).toUpperCase() + activePanel.slice(1) : ''}
      >
        {activePanel && <PanelContent type={activePanel} />}
      </SidePanel>
      <BottomBar txStatus={null} setLocalTxStatus={() => {}} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <PanelProvider>
      <WalletProviderWrapper>
        <DropsProvider>
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </DropsProvider>
      </WalletProviderWrapper>
    </PanelProvider>
  );
};

export default App;
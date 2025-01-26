import React, { useContext, useState } from 'react';
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
import { Position, TxStatus, Drop } from './types';
import { SettingsProvider } from './context/SettingsContext';

const AppContent: React.FC = () => {
  const { activeModal, closeModal } = useModal();
  const { walletAddress, profile } = useContext(WalletContext);
  const { activePanel, setActivePanel } = usePanel();
  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position>();

  const handleMapClick = (position: Position) => {
    setSelectedPosition(position);
    setActivePanel('loot');
  };

  const handleSubmit = async (data: Drop) => {
    console.log('Submitting drop:', data);
    // Implementation here
  };

  return (
    <div className="app-container">
      <NavBar />
      <div className="map-wrapper">
        <Map 
          setDropPosition={handleMapClick} 
          setTxStatus={(status: TxStatus | null) => {
            if (status && !status.action) return; // Guard against invalid status
            setTxStatus(status);
          }}
        />
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
      {activePanel && (
        <SidePanel 
          isOpen={true} 
          onClose={() => setActivePanel(null)}
          title={activePanel}
        >
          <PanelContent 
            type={activePanel}
            position={selectedPosition}
            onSubmit={handleSubmit}
            setTxStatus={setTxStatus}
          />
        </SidePanel>
      )}
      <BottomBar txStatus={txStatus} setLocalTxStatus={setTxStatus} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <PanelProvider>
      <SettingsProvider>
        <WalletProviderWrapper>
          <DropsProvider>
            <ModalProvider>
              <AppContent />
            </ModalProvider>
          </DropsProvider>
        </WalletProviderWrapper>
      </SettingsProvider>
    </PanelProvider>
  );
};

export default App;
import React, { useContext, useState, useEffect } from 'react';
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
import { OverlayProvider, useOverlay } from './context/OverlayContext';

const AppContent: React.FC = () => {
  const { activeModal, closeModal } = useModal();
  const { walletAddress, profile } = useContext(WalletContext);
  const { activePanel, setActivePanel } = usePanel();
  const { activeOverlay, setActiveOverlay } = useOverlay();
  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position>();

  // Effect to coordinate between different overlays
  useEffect(() => {
    if (activeOverlay === 'profile' && activeModal !== 'profile') {
      closeModal();
    } else if (activeOverlay === 'panel' && !activePanel) {
      setActivePanel(null);
    } else if (activeOverlay === null) {
      closeModal();
      setActivePanel(null);
    }
  }, [activeOverlay]);

  // Effect to update activeOverlay based on other states
  useEffect(() => {
    if (activeModal === 'profile') {
      setActiveOverlay('profile');
    } else if (activePanel) {
      setActiveOverlay('panel');
    }
  }, [activeModal, activePanel]);

  const handleMapClick = (position: Position) => {
    setSelectedPosition(position);
    setActivePanel('loot');
    setActiveOverlay('panel');
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
      {activeOverlay === 'profile' && activeModal === 'profile' && (
        <div className="self-profile">
          <UserProfile 
            walletAddress={walletAddress} 
            profile={profile} 
            onClose={() => {
              closeModal();
              setActiveOverlay(null);
            }}
          />
        </div>
      )}
      {activeOverlay === 'panel' && activePanel && (
        <SidePanel 
          isOpen={true} 
          onClose={() => {
            setActivePanel(null);
            setActiveOverlay(null);
          }}
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
    <OverlayProvider>
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
    </OverlayProvider>
  );
};

export default App;
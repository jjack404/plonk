import React, { createContext, useContext, useState, useCallback } from 'react';

type OverlayType = 'panel' | 'profile' | 'markerBlurb' | null;

interface OverlayContextType {
  activeOverlay: OverlayType;
  setActiveOverlay: (overlay: OverlayType) => void;
  closeAllOverlays: () => void;
}

const OverlayContext = createContext<OverlayContextType>({
  activeOverlay: null,
  setActiveOverlay: () => {},
  closeAllOverlays: () => {},
});

export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOverlay, setActiveOverlayState] = useState<OverlayType>(null);

  const setActiveOverlay = useCallback((overlay: OverlayType) => {
    // If we're setting a new overlay and it's different from the current one,
    // or if we're explicitly closing the overlay (overlay === null)
    setActiveOverlayState(overlay);
  }, []);

  const closeAllOverlays = useCallback(() => {
    setActiveOverlayState(null);
  }, []);

  return (
    <OverlayContext.Provider value={{ activeOverlay, setActiveOverlay, closeAllOverlays }}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext); 
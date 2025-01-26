import React, { createContext, useContext, useState } from 'react';

export type PanelType = 'activity' | 'notifications' | 'help' | 'loot' | 'settings';

interface PanelContextType {
  activePanel: PanelType | null;
  setActivePanel: (panel: PanelType | null) => void;
}

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export const PanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);

  return (
    <PanelContext.Provider value={{ activePanel, setActivePanel }}>
      {children}
    </PanelContext.Provider>
  );
};

export const usePanel = () => {
  const context = useContext(PanelContext);
  if (!context) throw new Error('usePanel must be used within PanelProvider');
  return context;
}; 
import React from 'react';
import { ActivityPanel } from './panels/ActivityPanel';
import { NotificationsPanel } from './panels/NotificationsPanel';
import { HelpPanel } from './panels/HelpPanel';
import { LootFormPanel } from './panels/LootFormPanel';
import SettingsPanel from './panels/SettingsPanel';
import { Position, Drop, TxStatus } from '../types';

interface PanelContentProps {
  type: 'activity' | 'notifications' | 'help' | 'loot' | 'settings';
  position?: Position;
  onSubmit?: (data: Drop) => void;
  setTxStatus?: (status: TxStatus | null) => void;
}

const PanelContent: React.FC<PanelContentProps> = ({ type, position, onSubmit, setTxStatus }) => {
  switch (type) {
    case 'activity':
      return <ActivityPanel />;
    case 'notifications':
      return <NotificationsPanel />;
    case 'help':
      return <HelpPanel />;
    case 'settings':
      return <SettingsPanel />;
    case 'loot':
      return position && onSubmit && setTxStatus ? (
        <LootFormPanel 
          position={position}
          onSubmit={onSubmit}
          setTxStatus={setTxStatus}
        />
      ) : null;
  }
};

export default PanelContent; 
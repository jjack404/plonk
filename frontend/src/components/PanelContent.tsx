import React from 'react';
import { ActivityPanel } from './panels/ActivityPanel';
import { NotificationsPanel } from './panels/NotificationsPanel';
import { HelpPanel } from './panels/HelpPanel';
import { LootFormPanel } from '../components/panels/LootFormPanel';
import { Position, Drop, TransactionStatus } from '../types';

interface PanelContentProps {
  type: 'activity' | 'notifications' | 'help' | 'loot';
  position?: Position;
  onSubmit?: (data: Drop) => void;
  setTxStatus?: (status: TransactionStatus | null) => void;
}

const PanelContent: React.FC<PanelContentProps> = ({ type, position, onSubmit, setTxStatus }) => {
  switch (type) {
    case 'activity':
      return <ActivityPanel />;
    case 'notifications':
      return <NotificationsPanel />;
    case 'help':
      return <HelpPanel />;
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
import React from 'react';
import { ActivityPanel } from './panels/ActivityPanel';
import { NotificationsPanel } from './panels/NotificationsPanel';
import { HelpPanel } from './panels/HelpPanel';

interface PanelContentProps {
  type: 'activity' | 'notifications' | 'help';
}

const PanelContent: React.FC<PanelContentProps> = ({ type }) => {
  switch (type) {
    case 'activity':
      return <ActivityPanel />;
    case 'notifications':
      return <NotificationsPanel />;
    case 'help':
      return <HelpPanel />;
  }
};

export default PanelContent; 
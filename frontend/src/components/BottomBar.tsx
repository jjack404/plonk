import React, { useCallback } from 'react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import './BottomBar.css';
import { 
  PiGpsDuotone, 
  PiGpsSlashDuotone, 
  PiSealQuestionDuotone,
  PiBellDuotone,
  PiClockCounterClockwiseDuotone,
  PiGearDuotone
} from "react-icons/pi";
import Notification from './Notification';
import { TxStatus } from '../types/index';
import { usePanel } from '../context/PanelContext';

interface BottomBarProps {
  txStatus: TxStatus | null;
  setLocalTxStatus: (status: TxStatus | null) => void;
}

const BottomBar: React.FC<BottomBarProps> = React.memo(({ 
  txStatus, 
  setLocalTxStatus 
}) => {
  const { latitude, longitude } = useCurrentLocation();
  const isLocationActive = latitude !== null && longitude !== null;
  const { setActivePanel } = usePanel();

  const getMessage = useCallback(() => {
    if (!txStatus) return '';
    
    // Use the message from txStatus if provided
    if (txStatus.message) {
      return txStatus.message;
    }

    // Fallback to generic messages
    const action = txStatus.action === 'drop' ? 'Dropping' : 'Claiming';
    return {
      pending: `${action}...`,
      success: `${action} Complete!`,
      error: `${action} Failed`
    }[txStatus.type] || '';
  }, [txStatus]);

  const handleNotificationClose = useCallback(() => {
    if (txStatus?.type === 'success') {
      setLocalTxStatus(null);
    }
  }, [txStatus, setLocalTxStatus]);

  const buttons = [
    {
      icon: <PiClockCounterClockwiseDuotone />,
      label: 'Activity',
      panel: 'activity',
      onClick: () => setActivePanel('activity')
    },
    {
      icon: <PiBellDuotone />,
      label: 'Notifications',
      panel: 'notifications',
      onClick: () => setActivePanel('notifications')
    },
    {
      icon: <PiSealQuestionDuotone />,
      label: 'Help',
      panel: 'help',
      onClick: () => setActivePanel('help')
    },
    {
      icon: <PiGearDuotone />,
      label: 'Settings',
      panel: 'settings',
      onClick: () => setActivePanel('settings')
    }
  ];

  return (
    <div className="bottom-bar">
      <div className="location-status">
        {isLocationActive ? (
          <div className="status-active">
            <PiGpsDuotone />
            <span>Active</span>
          </div>
        ) : (
          <div className="status-inactive">
            <PiGpsSlashDuotone />
            <span>Disabled</span>
          </div>
        )}
      </div>
      {txStatus && (
        <Notification
          message={getMessage()}
          type={txStatus.type}
          txId={txStatus.txId}
          onClose={handleNotificationClose}
        />
      )}
      <div className="button-group">
        {buttons.map((button, index) => (
          <React.Fragment key={index}>
            <button 
              className="help-button" 
              onClick={button.onClick}
              aria-label={button.label}
            >
              {button.icon}
            </button>
            {index < buttons.length - 1 && (
              <div className="bottom-bar-divider" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  if (!prevProps.txStatus && !nextProps.txStatus) return true;
  if (!prevProps.txStatus || !nextProps.txStatus) return false;
  
  return (
    prevProps.txStatus.type === nextProps.txStatus.type &&
    prevProps.txStatus.action === nextProps.txStatus.action &&
    prevProps.txStatus.txId === nextProps.txStatus.txId
  );
});

export default BottomBar; 
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
import { TransactionStatus } from '../types/index';
import { usePanel } from '../context/PanelContext';

interface BottomBarProps {
  txStatus: TransactionStatus | null;
  setLocalTxStatus: (status: TransactionStatus | null) => void;
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
    const action = txStatus.action === 'drop' ? 'Dropping' : 'Claiming';
    return txStatus.type === 'pending' ? `${action}...` : `${action} Complete!`;
  }, [txStatus]);

  const handleNotificationClose = useCallback(() => {
    if (txStatus?.type === 'success') {
      setLocalTxStatus(null);
    }
  }, [txStatus, setLocalTxStatus]);

  return (
    <div className="bottom-bar">
      <div className="location-status">
        {isLocationActive ? (
          <div className="status-active">
            <PiGpsDuotone />
            <span>Location Active</span>
          </div>
        ) : (
          <div className="status-inactive">
            <PiGpsSlashDuotone />
            <span>Location Disabled</span>
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
        <button className="help-button" onClick={() => setActivePanel('activity')}>
          <PiClockCounterClockwiseDuotone />
        </button>
        <button className="help-button" onClick={() => setActivePanel('notifications')}>
          <PiBellDuotone />
        </button>
        <button className="help-button" onClick={() => setActivePanel('help')}>
          <PiSealQuestionDuotone />
        </button>
        <button style={{ display: 'none' }} className="help-button">
          <PiGearDuotone />
        </button>
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
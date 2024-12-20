import React from 'react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import './BottomBar.css';
import { 
  PiGpsDuotone, 
  PiGpsSlashDuotone, 
  PiSealQuestionDuotone,
  PiBellDuotone,
  PiClockCounterClockwiseDuotone
} from "react-icons/pi";
import Notification from './Notification';

interface BottomBarProps {
  txStatus: { type: 'pending' | 'success'; txId?: string; action?: 'drop' | 'claim' } | null;
}

const BottomBar: React.FC<BottomBarProps> = ({ txStatus }) => {
  const { latitude, longitude } = useCurrentLocation();
  const isLocationActive = latitude !== null && longitude !== null;

  const getMessage = () => {
    if (!txStatus) return '';
    const action = txStatus.action === 'drop' ? 'Dropping' : 'Claiming';
    return txStatus.type === 'pending' ? `${action}...` : `${action} Complete!`;
  };

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
          onClose={() => {}}
        />
      )}
      <div className="button-group">
        <button className="help-button">
          <PiClockCounterClockwiseDuotone style={{ color: '#fffbbd' }} />
        </button>
        <button className="help-button">
          <PiBellDuotone style={{ color: '#fffbbd' }} />
        </button>
        <button className="help-button">
          <PiSealQuestionDuotone />
        </button>
      </div>
    </div>
  );
};

export default BottomBar; 
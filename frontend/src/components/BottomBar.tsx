import React from 'react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import './BottomBar.css';
import { PiGpsDuotone, PiGpsSlashDuotone } from "react-icons/pi";

const BottomBar: React.FC = () => {
  const { latitude, longitude } = useCurrentLocation();
  const isLocationActive = latitude !== null && longitude !== null;

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
    </div>
  );
};

export default BottomBar; 
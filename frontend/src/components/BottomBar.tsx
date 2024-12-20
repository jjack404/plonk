import React from 'react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import './BottomBar.css';
import { MdLocationOn, MdLocationOff } from 'react-icons/md';

const BottomBar: React.FC = () => {
  const { latitude, longitude } = useCurrentLocation();
  const isLocationActive = latitude !== null && longitude !== null;

  return (
    <div className="bottom-bar">
      <div className="location-status">
        <div className={`status-circle ${isLocationActive ? 'active' : 'inactive'}`} />
        {isLocationActive ? (
          <div className="status-active">
            <MdLocationOn />
            <span>Location Active</span>
          </div>
        ) : (
          <div className="status-inactive">
            <MdLocationOff />
            <span>Location Disabled</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomBar; 
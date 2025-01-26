import React, { useState, useEffect } from 'react';
import { Drop } from '../types';
import './MarkerBlurb.css';
import { getLocationImage } from '../utils/locationImage';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { calculateDistance } from '../utils/distance';
import PanoramaView from './PanoramaView';
import MiniMap from './MiniMap';
import { PiWalletDuotone } from "react-icons/pi";
import { useSettings } from '../context/SettingsContext';
import { formatLocation } from '../utils/formatLocation';

interface MarkerBlurbProps {
  drop: Drop | null;
  position: { x: number; y: number };
  expanded: boolean;
  onExpand: () => void;
  onClaim?: (drop: Drop) => void;
  walletAddress: string | null;
  onConnectWallet: () => void;
}

const MarkerBlurb: React.FC<MarkerBlurbProps> = React.memo(({
  drop,
  position,
  expanded,
  onExpand,
  onClaim,
  walletAddress,
  onConnectWallet
}) => {
  const { latitude, longitude, isLoading: locationLoading, error: locationError } = useCurrentLocation();
  const [isInRange, setIsInRange] = useState<boolean | null>(null);
  const [locationData, setLocationData] = useState<{
    type: 'panorama' | 'map';
    location?: { lat: number; lng: number; pano?: string };
  } | null>(null);
  const [blurbStyle, setBlurbStyle] = useState<React.CSSProperties>({
    position: 'absolute' as 'absolute',
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -100%)'
  });
  const [distance, setDistance] = useState<number | null>(null);
  const { distanceUnit } = useSettings();

  useEffect(() => {
    if (expanded && drop) {
      getLocationImage(drop.position).then(setLocationData);
    }
  }, [expanded, drop]);

  useEffect(() => {
    if (!expanded || !drop) {
      return;
    }

    if (locationError) {
      setIsInRange(false);
      return;
    }

    if (locationLoading || !latitude || !longitude) {
      setIsInRange(null);
      return;
    }

    const currentDistance = calculateDistance(
      latitude,
      longitude,
      drop.position.lat,
      drop.position.lng
    );

    setDistance(currentDistance);
    setIsInRange(currentDistance <= 1);

  }, [expanded, drop, latitude, longitude, locationLoading, locationError]);

  useEffect(() => {
    if (expanded) {
      setBlurbStyle({
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        maxHeight: 'calc(100vh - 120px)',
        marginTop: '30px'
      });
    } else {
      setBlurbStyle({
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
        maxHeight: '300px',
        pointerEvents: expanded ? 'auto' : 'none'
      });
    }
  }, [position, expanded]);

  if (!drop) return null;

  const abbreviateAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const renderTokens = () => (
    <ul className="token-list">
      {drop.tokens.map((token, index) => (
        <li key={index} className="token-item">
          <div className="token-info">
            <img
              src={token.logoURI || `https://placehold.co/24x24?text=${token.symbol}`}
              alt={token.symbol}
              className="token-list-image"
            />
            <span>{token.symbol}</span>
          </div>
          <span className="token-amount">{token.amount}</span>
        </li>
      ))}
    </ul>
  );

  const renderLocationStatus = () => {
    if (!expanded) return null;

    if (locationError) {
      return (
        <div className="location-status error">
          <p>Location access needed to claim drop</p>
          <button 
            className="enable-location-button"
            onClick={() => window.location.reload()}
          >
            Enable Location
          </button>
        </div>
      );
    }

    if (locationLoading || isInRange === null) {
      return (
        <div className="location-checking">
          <div className="loading-spinner" />
          <p>Checking location...</p>
        </div>
      );
    }

    if (!isInRange) {
      const displayDistance = distanceUnit === 'mi' 
        ? (distance! * 0.621371).toFixed(2)
        : distance!.toFixed(2);
      
      return (
        <div className="distance-warning">
          <p>You need to be within {distanceUnit === 'mi' ? '0.62' : '1'} {distanceUnit} to claim this drop</p>
          {distance && (
            <span>Currently {displayDistance} {distanceUnit} away</span>
          )}
        </div>
      );
    }

    return (
      <button 
        className="claim-button"
        onClick={() => onClaim?.(drop)}
        disabled={!walletAddress}
      >
        {walletAddress ? 'Claim Drop' : (
          <div onClick={onConnectWallet} className="connect-wallet-button">
            <PiWalletDuotone size={20} />
            <span>Connect Wallet to Claim</span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div
      className={`marker-blurb ${expanded ? 'expanded' : ''}`}
      style={blurbStyle}
      onClick={(e) => {
        e.stopPropagation();
        if (!expanded) onExpand();
      }}
    >
      {expanded ? (
        <>
          <div className="drop-header">
            <h3>{drop.title}</h3>
            <span className="drop-value">$0.00</span>
          </div>
          <div className="location-image">
            {locationData?.type === 'panorama' && locationData.location ? (
              <PanoramaView
                position={locationData.location}
                onError={() => setLocationData({
                  type: 'map',
                  location: drop?.position
                })}
              />
            ) : (
              <MiniMap position={drop?.position} />
            )}
          </div>
          {renderTokens()}
          <p className="description">{drop.description}</p>
          <div className="drop-info">
            <span className="wallet">By: {abbreviateAddress(drop.walletAddress)}</span>
            <div className="location-details">
              <span className="location">
                {formatLocation(drop.position.city, drop.position.country) || 'Unknown Location'}
              </span>
              <span className="coordinates">
                {`${drop.position.lat.toFixed(4)}, ${drop.position.lng.toFixed(4)}`}
              </span>
            </div>
          </div>
          {renderLocationStatus()}
        </>
      ) : (
        <>
          {renderTokens()}
          <div className="mini-location">
            {formatLocation(drop.position.city, drop.position.country) || 
             `${drop.position.lat.toFixed(4)}, ${drop.position.lng.toFixed(4)}`}
          </div>
        </>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.drop?._id === nextProps.drop?._id &&
    prevProps.position.x === nextProps.position.x &&
    prevProps.position.y === nextProps.position.y &&
    prevProps.expanded === nextProps.expanded &&
    prevProps.walletAddress === nextProps.walletAddress
  );
});

export default MarkerBlurb;

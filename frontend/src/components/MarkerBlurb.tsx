import React, { useState, useEffect } from 'react';
import { Drop } from '../types';
import './MarkerBlurb.css';
import { getLocationImage } from '../utils/locationImage';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { calculateDistance } from '../utils/distance';
import PanoramaView from './PanoramaView';

interface MarkerBlurbProps {
  drop: Drop | null;
  position: { x: number; y: number };
  expanded: boolean;
  onExpand: () => void;
  onClaim?: (drop: Drop) => void;
  walletAddress: string | null;
  onConnectWallet: () => void;
}

const getStaticMapUrl = (lat: number, lng: number): string => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=300x150&markers=color:red%7C${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
};

const MarkerBlurb: React.FC<MarkerBlurbProps> = ({
  drop,
  position,
  expanded,
  onExpand,
  onClaim,
  walletAddress,
  onConnectWallet
}) => {
  const { latitude, longitude } = useCurrentLocation();
  const [isInRange, setIsInRange] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(true);
  const [locationData, setLocationData] = useState<{
    type: 'panorama' | 'static';
    url?: string;
    location?: { lat: number; lng: number; pano?: string };
  } | null>(null);
  const [blurbStyle, setBlurbStyle] = useState<React.CSSProperties>({
    position: 'absolute' as 'absolute',
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -100%)'
  });

  useEffect(() => {
    if (expanded && drop) {
      getLocationImage(drop.position).then(setLocationData);
    }
  }, [expanded, drop]);

  useEffect(() => {
    if (drop) {
      setIsCheckingLocation(true);
      if (latitude !== null && longitude !== null) {
        const distance = calculateDistance(
          latitude,
          longitude,
          drop.position.lat,
          drop.position.lng
        );
        setIsInRange(distance <= 1);
      }
      setIsCheckingLocation(false);
    }
  }, [drop, latitude, longitude]);

  useEffect(() => {
    if (expanded) {
      setBlurbStyle({
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        maxHeight: '80vh'
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
        <li key={index} className="token-list-item">
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

  const renderClaimButton = () => {
    if (!walletAddress) {
      return (
        <button 
          className="claim-button"
          onClick={onConnectWallet}
        >
          Select Wallet
        </button>
      );
    }

    if (isCheckingLocation) {
      return (
        <div className="location-checking">
          <div className="mini-loader"></div>
          <p>Checking your location...</p>
        </div>
      );
    }

    if (latitude === null || longitude === null) {
      return (
        <div className="distance-warning">
          <p>Please enable location services to see if you can claim</p>
        </div>
      );
    }

    if (!isInRange) {
      return (
        <div className="distance-warning">
          <p>You must be within 1 mile of the drop location to claim it</p>
        </div>
      );
    }

    return (
      <button 
        className="claim-button"
        onClick={() => drop && onClaim?.(drop)}
      >
        Claim Drop
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
      <div className="marker-blurb-content">
        {expanded ? (
          <>
            {expanded && locationData && (
              <div className="location-image">
                {locationData.type === 'panorama' && locationData.location ? (
                  <PanoramaView 
                    position={locationData.location}
                    onError={() => setLocationData({ 
                      type: 'static', 
                      url: getStaticMapUrl(drop.position.lat, drop.position.lng) 
                    })}
                  />
                ) : (
                  <img src={locationData.url} alt="Location view" />
                )}
              </div>
            )}
            <h3>{drop.title}</h3>
            {renderTokens()}
            <p className="description">{drop.description}</p>
            <div className="drop-info">
              <span className="wallet">By: {abbreviateAddress(drop.walletAddress)}</span>
              <span className="location">
                {drop.position.city && drop.position.country
                  ? `${drop.position.city}, ${drop.position.country}`
                  : drop.position.country || 'Unknown Location'}
              </span>
            </div>
            {renderClaimButton()}
          </>
        ) : (
          <>
            {renderTokens()}
          </>
        )}
      </div>
    </div>
  );
};

export default MarkerBlurb;

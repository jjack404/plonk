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
}

// Add a utility function to detect mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const getStaticMapUrl = (lat: number, lng: number): string => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=300x150&markers=color:red%7C${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
};

const MarkerBlurb: React.FC<MarkerBlurbProps> = ({
  drop,
  position,
  expanded,
  onExpand,
  onClaim
}) => {
  const { latitude, longitude } = useCurrentLocation();
  const [isInRange, setIsInRange] = useState(false);
  const [locationData, setLocationData] = useState<{
    type: 'panorama' | 'static';
    url?: string;
    location?: { lat: number; lng: number; pano?: string };
  } | null>(null);

  useEffect(() => {
    if (expanded && drop) {
      getLocationImage(drop.position).then(setLocationData);
    }
  }, [expanded, drop]);

  useEffect(() => {
    if (drop && latitude && longitude) {
      const distance = calculateDistance(
        latitude,
        longitude,
        drop.position.lat,
        drop.position.lng
      );

      setIsInRange(distance <= 1); // Within 1 mile
    }
  }, [drop, latitude, longitude]);

  // Automatically expand on mobile when marker is clicked
  const handleClick = () => {
    if (isMobile()) {
      onExpand();
    }
  };

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

  return (
    <div
      className={`marker-blurb ${expanded ? 'expanded' : ''}`}
      onClick={handleClick}
      style={{ 
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)'
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
            {isInRange && drop.status !== 'Claimed' && (
              <button
                className="claim-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClaim?.(drop);
                }}
              >
                Claim Drop
              </button>
            )}
            {!isInRange && expanded && (
              <p className="distance-warning">
                You must be within 1 mile of the drop location to claim it
              </p>
            )}
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

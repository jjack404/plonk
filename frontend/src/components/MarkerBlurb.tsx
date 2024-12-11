import React, { useState, useEffect } from 'react';
import { Drop } from '../types';
import './MarkerBlurb.css';
import { getLocationImage } from '../utils/locationImage';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { calculateDistance } from '../utils/distance';

interface MarkerBlurbProps {
  drop: Drop | null;
  position: { x: number; y: number };
  expanded: boolean;
  onExpand: () => void;
  onClaim?: (drop: Drop) => void;
}

const MarkerBlurb: React.FC<MarkerBlurbProps> = ({ 
  drop, 
  position, 
  expanded, 
  onExpand,
  onClaim 
}) => {
  const { latitude, longitude } = useCurrentLocation();
  const [isInRange, setIsInRange] = useState(false);
  const [locationImage, setLocationImage] = useState<string>('');
  
  useEffect(() => {
    if (expanded && drop) {
      getLocationImage(drop.position).then(setLocationImage);
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
      console.log('Distance to drop:', distance, 'miles');
      console.log('Current location:', latitude, longitude);
      console.log('Drop location:', drop.position.lat, drop.position.lng);
      setIsInRange(distance <= 1); // Within 1 mile
    }
  }, [drop, latitude, longitude]);

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
      style={{ 
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
      onClick={onExpand}
    >
      <div className="marker-blurb-content">
        {expanded ? (
          <>
            {locationImage && (
              <div className="location-image">
                <img src={locationImage} alt="Location view" />
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

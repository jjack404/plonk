import React, { useState, useEffect, useCallback } from 'react';
import { Drop } from '../types';
import './MarkerBlurb.css';
import { getLocationImage } from '../utils/locationImage';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { calculateDistance } from '../utils/distance';
import PanoramaView from './PanoramaView';
import { PiWalletDuotone } from "react-icons/pi";

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

const MarkerBlurb: React.FC<MarkerBlurbProps> = React.memo(({
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
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (expanded && drop) {
      getLocationImage(drop.position).then(setLocationData);
    }
  }, [expanded, drop]);

  const checkLocation = useCallback(() => {
    if (drop && latitude !== null && longitude !== null) {
      const roughDistance = calculateDistance(
        latitude,
        longitude,
        drop.position.lat,
        drop.position.lng
      );

      setDistance(roughDistance);

      if (roughDistance > 2) {
        setIsInRange(false);
        setIsCheckingLocation(false);
        return;
      }

      setIsCheckingLocation(true);
      const preciseDistance = calculateDistance(
        latitude,
        longitude,
        drop.position.lat,
        drop.position.lng
      );
      setDistance(preciseDistance);
      setIsInRange(preciseDistance <= 1);
      setIsCheckingLocation(false);
    }
  }, [drop, latitude, longitude]);

  useEffect(() => {
    checkLocation();
  }, [checkLocation]);

  useEffect(() => {
    if (expanded) {
      const intervalId = setInterval(checkLocation, 500);
      return () => clearInterval(intervalId);
    }
  }, [expanded, checkLocation]);

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

  const renderClaimButton = () => {
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
        <>
          {distance && (
            <div className="distance-display">
              <span>{distance.toFixed(2)} miles</span> away
            </div>
          )}
          <div className="distance-warning">
            <p>You must be within 1 mile of the drop location to claim it</p>
          </div>
        </>
      );
    }

    if (!walletAddress) {
      return (
        <button
          className="claim-button wallet-connect"
          onClick={(e) => {
            e.stopPropagation();
            onConnectWallet();
          }}
        >
          <PiWalletDuotone className="wallet-icon" />
          <span>Select Wallet</span>
        </button>
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
      {expanded ? (
        <>
          <div className="drop-header">
            <h3>{drop.title}</h3>
            <span className="drop-value">$0.00</span>
          </div>
          {locationData && (
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
          <div className="mini-location">
            {drop.position.city && drop.position.country
              ? `${drop.position.city}, ${drop.position.country}`
              : drop.position.country ||
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

import React, { useContext, useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { WalletContext } from '../context/WalletContext';
import { Drop, Position } from '../types';
import './Map.css';
import { useDrops } from '../context/DropsContext';
import { useMapInteractions } from '../hooks/useMapInteractions';
import { mapStyles } from '../styles/mapStyles';
import MapMarker from './MapMarker';
import MarkerBlurb from './MarkerBlurb';
import LootForm from './LootForm';
import { isMobileDevice } from '../utils/device';
import axios from 'axios';
import { Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Buffer } from 'buffer';
import pepeIcon from '../assets/pepe.png';

interface TransactionStatus {
  type: 'pending' | 'success';
  txId?: string;
  action?: 'drop' | 'claim';
}

interface MapProps {
  setTxStatus: (status: TransactionStatus | null) => void;
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%'
};

const center: Position = {
  lat: 20,
  lng: 0
};

const Map: React.FC<MapProps> = ({ setTxStatus }) => {
  const { walletAddress } = useContext(WalletContext);
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const { drops, setDrops } = useDrops();
  const {
    showForm,
    setShowForm,
    formPosition,
    setFormPosition,
    mapRef,
    hoveredMarker,
    setHoveredMarker,
    expandedMarker,
    setExpandedMarker,
    markerPosition,
    handleMapClick,
    handleMapRightClick,
    handleMarkerMouseOver
  } = useMapInteractions(walletAddress);

  const [dropMode, setDropMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragImageRef = useRef<HTMLImageElement | null>(null);

  const handleCloseForm = (): void => {
    setShowForm(false);
    setFormPosition(null);
  };

  const handleSubmitForm = async (data: Drop): Promise<void> => {
    if (!formPosition) return;
    setDrops(drops.concat(data));
    handleCloseForm();
  };

  const handleMapLoad = (map: google.maps.Map): void => {
    mapRef.current = map;
    
    // Add a listener for Street View changes
    const streetView = map.getStreetView();
    streetView.setOptions({
      imageDateControl: false,
      motionTracking: false,
      motionTrackingControl: false,
      addressControl: false,
      linksControl: true,
      panControl: true,
      enableCloseButton: true,
      visible: false
    });
  };

  const handleClaimDrop = async (drop: Drop) => {
    try {
      if (!walletAddress || !publicKey) {
        throw new Error('Wallet not connected');
      }
      
      setTxStatus({ type: 'pending', action: 'claim' });
      
      // Get partially signed transaction from backend
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/drops/${drop._id}/claim`,
        {},
        { headers: { 'wallet-address': walletAddress } }
      );

      const transaction = Transaction.from(
        Buffer.from(response.data.transaction, 'base64')
      );

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      setTxStatus({ type: 'pending', txId: signature });

      await connection.confirmTransaction(signature, 'confirmed');
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/drops/${drop._id}/transaction`,
        { txId: signature, status: 'Claimed' },
        { headers: { 'wallet-address': walletAddress } }
      );

      // Update local drops state by filtering out the claimed drop
      setDrops(drops.filter(d => d._id !== drop._id));

      setTxStatus({ type: 'success', txId: signature, action: 'claim' });
      setExpandedMarker(null);
    } catch (error) {
      console.error('Claim error:', error);
      setTxStatus(null);
    }
  };

  // Add touch/mouse event handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!dragImageRef.current) return;
    
    setIsDragging(true);
    dragImageRef.current.style.opacity = '0.7';
    
    if ('touches' in e) {
      setDragPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else {
      setDragPosition({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragImageRef.current) return;

    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragPosition({ x, y });
    dragImageRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragImageRef.current || !mapRef.current) return;

    const x = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const y = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

    // Convert screen coordinates to map coordinates
    const point = new google.maps.Point(x, y);
    const topRight = mapRef.current.getProjection()?.fromLatLngToPoint(
      mapRef.current.getBounds()?.getNorthEast()!
    );
    const bottomLeft = mapRef.current.getProjection()?.fromLatLngToPoint(
      mapRef.current.getBounds()?.getSouthWest()!
    );

    if (topRight && bottomLeft) {
      const latLng = mapRef.current.getProjection()?.fromPointToLatLng(
        new google.maps.Point(
          (point.x / window.innerWidth) * (topRight.x - bottomLeft.x) + bottomLeft.x,
          (point.y / window.innerHeight) * (topRight.y - bottomLeft.y) + bottomLeft.y
        )
      );

      if (latLng) {
        setFormPosition({
          lat: latLng.lat(),
          lng: latLng.lng()
        });
        setShowForm(true);
      }
    }

    setIsDragging(false);
    dragImageRef.current.style.opacity = '1';
    setDragPosition(null);
  };

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  // Only show the draggable marker on mobile
  const showDraggableMarker = isMobileDevice();

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      {showDraggableMarker && (
        <img
          ref={dragImageRef}
          src={pepeIcon}
          className={`drop-marker-button ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          alt="Drop marker"
        />
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        mapContainerClassName="map-container"
        center={center}
        zoom={2}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        onRightClick={handleMapRightClick}
        options={{ 
          styles: mapStyles, 
          fullscreenControl: false,
          clickableIcons: false,
          streetViewControl: true,
          minZoom: 2,
          maxZoom: 18,
          restriction: {
            latLngBounds: {
              north: 85,
              south: -85,
              west: -180,
              east: 180
            },
            strictBounds: true
          }
        }}
      >
        {Array.isArray(drops) && window.google && drops.map((marker, index) => (
          <MapMarker
            key={index}
            marker={marker}
            onMouseOver={handleMarkerMouseOver}
            onMouseOut={() => !isMobileDevice() && setHoveredMarker(null)}
            onClick={() => {
              if (isMobileDevice()) {
                setExpandedMarker(marker);
                setHoveredMarker(null);
              } else {
                setExpandedMarker(expandedMarker === marker ? null : marker);
              }
            }}
          />
        ))}
        
        {(hoveredMarker || expandedMarker) && markerPosition && (
          <MarkerBlurb
            drop={expandedMarker || hoveredMarker}
            position={markerPosition}
            expanded={!!expandedMarker}
            onExpand={() => setExpandedMarker(hoveredMarker)}
            onClaim={handleClaimDrop}
          />
        )}

        {showForm && formPosition && (
          <LootForm
            position={formPosition}
            onClose={handleCloseForm}
            onSubmit={handleSubmitForm}
            setTxStatus={setTxStatus}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;

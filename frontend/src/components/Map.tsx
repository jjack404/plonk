import React, { useContext } from 'react';
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
  const { drops, addDrop } = useDrops();
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

  const handleCloseForm = (): void => {
    setShowForm(false);
    setFormPosition(null);
  };

  const handleSubmitForm = async (data: Drop): Promise<void> => {
    if (!formPosition) return;
    addDrop(data);
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

      // Deserialize and send transaction
      const transaction = Transaction.from(
        Buffer.from(response.data.transaction, 'base64')
      );

      // Send for final signature and broadcast
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      setTxStatus({ type: 'pending', txId: signature });

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Update drop status
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/drops/${drop._id}/transaction`,
        { txId: signature, status: 'Claimed' },
        { headers: { 'wallet-address': walletAddress } }
      );

      setTxStatus({ type: 'success', txId: signature, action: 'claim' });
      setExpandedMarker(null);
    } catch (error) {
      console.error('Claim error:', error);
      setTxStatus(null);
    }
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
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

import React, { useContext, useState, useEffect } from 'react';
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
import Loader from './Loader';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import BottomBar from './BottomBar';

interface TransactionStatus {
  type: 'pending' | 'success';
  txId?: string;
  action?: 'drop' | 'claim';
}

interface MapProps {
  setTxStatus: (status: TransactionStatus | null) => void;
}

const center: Position = {
  lat: 20,
  lng: 0
};

const Map: React.FC<MapProps> = ({ setTxStatus }) => {
  const { walletAddress } = useContext(WalletContext);
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const { drops, setDrops, isLoading: dropsLoading, error: dropsError } = useDrops();
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

  const [dropsLoaded, setDropsLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [localTxStatus, setLocalTxStatus] = useState<TransactionStatus | null>(null);
  const { setVisible } = useWalletModal();

  useEffect(() => {
    if (!dropsLoading && !dropsError) {
      setDropsLoaded(true);
    }
  }, [dropsLoading, dropsError]);

  const updateTxStatus = (status: TransactionStatus | null) => {
    setTxStatus(status);
    setLocalTxStatus(status);
  };

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
    setMapLoaded(true);
    
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
      
      updateTxStatus({ type: 'pending', action: 'claim' });
      
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

      updateTxStatus({ type: 'pending', txId: signature });

      await connection.confirmTransaction(signature, 'confirmed');
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/drops/${drop._id}/transaction`,
        { txId: signature, status: 'Claimed' },
        { headers: { 'wallet-address': walletAddress } }
      );

      setDrops(drops.filter(d => d._id !== drop._id));

      updateTxStatus({ type: 'success', txId: signature, action: 'claim' });
      setExpandedMarker(null);
    } catch (error) {
      console.error('Claim error:', error);
      updateTxStatus(null);
    }
  };

  const isLoading = !dropsLoaded || !mapLoaded;

  return (
    <>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Loader isLoading={isLoading} />
        {dropsError && <div className="error-message">{dropsError}</div>}
        <GoogleMap
          mapContainerClassName={`map-container ${isLoading ? 'loading' : ''}`}
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
              key={marker._id || index}
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
              walletAddress={walletAddress}
              onConnectWallet={() => setVisible(true)}
            />
          )}

          {showForm && formPosition && (
            <LootForm
              position={formPosition}
              onClose={handleCloseForm}
              onSubmit={handleSubmitForm}
              setTxStatus={updateTxStatus}
            />
          )}
        </GoogleMap>
      </LoadScript>
      <BottomBar txStatus={localTxStatus} />
    </>
  );
};

export default Map;

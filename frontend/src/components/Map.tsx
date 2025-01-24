import React, { useContext, useState, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { WalletContext } from '../context/WalletContext';
import { Drop, Position, TxStatus } from '../types';
import './Map.css';
import { useDrops } from '../context/DropsContext';
import { useMapInteractions } from '../hooks/useMapInteractions';
import { mapStyles } from '../styles/mapStyles';
import MapMarker from './MapMarker';
import MarkerBlurb from './MarkerBlurb';
import { isMobileDevice } from '../utils/device';
import axios from 'axios';
import { Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Buffer } from 'buffer';
import Loader from './Loader';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import WelcomeModal from './WelcomeModal';
import { usePanel } from '../context/PanelContext';

interface MapProps {
  setTxStatus: (status: TxStatus | null) => void;
  setDropPosition: (position: Position) => void;
}

const center: Position = {
  lat: 20,
  lng: 0
};

const Map: React.FC<MapProps> = ({ setTxStatus, setDropPosition }) => {
  const { walletAddress } = useContext(WalletContext);
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const { drops, setDrops, isLoading: dropsLoading, error: dropsError } = useDrops();
  const {
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
    handleMarkerMouseOver
  } = useMapInteractions(walletAddress);

  const [dropsLoaded, setDropsLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { setVisible } = useWalletModal();
  const [visibleMarkers, setVisibleMarkers] = useState<Drop[]>([]);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [activeStreetView, setActiveStreetView] = useState<google.maps.StreetViewPanorama | null>(null);
  const { setActivePanel } = usePanel();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (!dropsLoading && !dropsError) {
      setDropsLoaded(true);
    }
  }, [dropsLoading, dropsError]);

  const updateTxStatus = useCallback((status: TxStatus | null) => {
    setTxStatus(status);
  }, [setTxStatus]);

  const handleCloseForm = (): void => {
    setShowForm(false);
    setFormPosition(null);
  };

  const isMarkerInBounds = useCallback((marker: Drop, bounds: google.maps.LatLngBounds) => {
    return bounds.contains({
      lat: marker.position.lat,
      lng: marker.position.lng
    });
  }, []);

  // @ts-ignore - Will be used in future implementation
  const handleSubmitForm = useCallback(async (data: Drop): Promise<void> => {
    if (!formPosition) return;
    
    if (bounds && isMarkerInBounds(data, bounds)) {
      setVisibleMarkers(prev => [...prev, data]);
    }
    
    setDrops(drops.concat(data));
    handleCloseForm();
  }, [formPosition, bounds, isMarkerInBounds, drops, setDrops, handleCloseForm]);

  const handleMapLoad = useCallback((map: google.maps.Map): void => {
    mapRef.current = map;
    setMapLoaded(true);
    
    const initialBounds = map.getBounds();
    if (initialBounds) {
      setBounds(initialBounds);
    }
    
    const streetView = map.getStreetView();
    setActiveStreetView(streetView);
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
  }, []);

  useEffect(() => {
    return () => {
      if (activeStreetView) {
        activeStreetView.setVisible(false);
        setActiveStreetView(null);
      }
    };
  }, [activeStreetView]);

  const handleStreetViewVisibilityChange = useCallback(() => {
    if (activeStreetView?.getVisible()) {
      setExpandedMarker(null);
      setHoveredMarker(null);
    }
  }, [setExpandedMarker, setHoveredMarker]);

  useEffect(() => {
    if (activeStreetView) {
      google.maps.event.addListener(activeStreetView, 'visible_changed', handleStreetViewVisibilityChange);
      
      return () => {
        google.maps.event.clearListeners(activeStreetView, 'visible_changed');
      };
    }
  }, [activeStreetView, handleStreetViewVisibilityChange]);

  const handleClaimDrop = useCallback(async (drop: Drop) => {
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

      updateTxStatus({ type: 'pending', action: 'claim', txId: signature });

      await connection.confirmTransaction(signature, 'confirmed');
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/drops/${drop._id}/transaction`,
        { txId: signature, status: 'Claimed' },
        { headers: { 'wallet-address': walletAddress } }
      );

      setDrops(drops.filter(d => d._id !== drop._id));

      updateTxStatus({ type: 'success', action: 'claim', txId: signature });
      setExpandedMarker(null);
    } catch (error) {
      console.error('Claim error:', error);
      updateTxStatus(null);
    }
  }, [walletAddress, publicKey, connection, sendTransaction, updateTxStatus]);

  const isLoading = !dropsLoaded || !mapLoaded;

  useEffect(() => {
    if (bounds && Array.isArray(drops)) {
      const markersInView = drops.filter(marker => isMarkerInBounds(marker, bounds));
      setVisibleMarkers(markersInView);
    }
  }, [bounds, drops, isMarkerInBounds]);

  const handleBoundsChanged = useCallback(() => {
    if (mapRef.current) {
      const newBounds = mapRef.current.getBounds();
      if (newBounds) {
        setBounds(newBounds);
      }
    }
  }, []);

  const handleRightClick = useCallback((e: google.maps.MapMouseEvent) => {
    e.stop();
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } })
        .then(result => {
          if (result.results[0]) {
            const addressComponents = result.results[0].address_components;
            const city = addressComponents.find(c => 
              c.types.includes('locality') || 
              c.types.includes('administrative_area_level_1')
            )?.long_name;
            const country = addressComponents.find(c => 
              c.types.includes('country')
            )?.long_name;

            setDropPosition({ lat, lng, city, country });
          }
        })
        .catch(error => {
          console.error('Geocoding error:', error);
          setDropPosition({ lat, lng });
        });
    } catch (error) {
      console.error('Geocoding error:', error);
      setDropPosition({ lat, lng });
    }
    
    setActivePanel('loot');
  }, [setDropPosition, setActivePanel]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <Loader isLoading={isLoading} />
      {dropsError && <div className="error-message">{dropsError}</div>}
      <GoogleMap
        mapContainerClassName={`map-container ${isLoading ? 'loading' : ''}`}
        center={center}
        zoom={2}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        onRightClick={handleRightClick}
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
        onBoundsChanged={handleBoundsChanged}
      >
        {Array.isArray(visibleMarkers) && window.google && visibleMarkers.map((marker, index) => (
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
      </GoogleMap>
      <WelcomeModal />
    </>
  );
};

export default Map;

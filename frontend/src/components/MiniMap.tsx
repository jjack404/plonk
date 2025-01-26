import { GoogleMap, MarkerF } from '@react-google-maps/api';
import React, { useRef, useState } from 'react';
import { mapStyles } from '../styles/mapStyles';

interface MiniMapProps {
  position: { lat: number; lng: number };
}

const MiniMap: React.FC<MiniMapProps> = ({ position }) => {
  const [zoom, setZoom] = useState(13);
  const mapRef = useRef<google.maps.Map>();
  
  const mapOptions = {
    disableDefaultUI: true,
    draggable: false,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    mapTypeId: 'roadmap',
    minZoom: 11,
    maxZoom: 16,
    styles: mapStyles,
    gestureHandling: 'none',
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP
    }
  };

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleZoomChanged = () => {
    if (mapRef.current) {
      const newZoom = mapRef.current.getZoom();
      if (newZoom) {
        setZoom(newZoom);
      }
    }
  };

  return (
    <div className="location-image" style={{ border: 'none', height: '100%' }}>
      <GoogleMap
        options={mapOptions}
        center={position}
        zoom={zoom}
        onLoad={handleMapLoad}
        onZoomChanged={handleZoomChanged}
        mapContainerClassName="mini-map"
      >
        <MarkerF position={position} />
      </GoogleMap>
    </div>
  );
};

export default MiniMap; 
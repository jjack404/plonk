import React from 'react';
import { OverlayView } from '@react-google-maps/api';
import { Drop } from '../types';
import { PiMapPinDuotone } from "react-icons/pi";
import { isMobileDevice } from '../utils/device';

interface MapMarkerProps {
  marker: Drop;
  onMouseOver: (marker: Drop, e: google.maps.MapMouseEvent) => void;
  onMouseOut: () => void;
  onClick: () => void;
}

const MapMarker: React.FC<MapMarkerProps> = ({
  marker,
  onMouseOver,
  onMouseOut,
  onClick
}) => {
  const handleMarkerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const syntheticEvent = {
      latLng: new google.maps.LatLng(marker.position.lat, marker.position.lng),
      domEvent: e.nativeEvent
    } as google.maps.MapMouseEvent;
    
    onMouseOver(marker, syntheticEvent);
    onClick();
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    if (!isMobileDevice()) {
      const syntheticEvent = {
        latLng: new google.maps.LatLng(marker.position.lat, marker.position.lng),
        domEvent: e.nativeEvent
      } as google.maps.MapMouseEvent;
      
      onMouseOver(marker, syntheticEvent);
    }
  };

  return (
    <OverlayView
      position={marker.position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => ({
        x: -16,
        y: -32
      })}
    >
      <div 
        style={{ 
          cursor: 'pointer',
          fontSize: '32px',
          color: 'var(--color-success)',
          filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.7))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          position: 'relative'
        }}
        onClick={handleMarkerClick}
        onMouseOver={handleMouseOver}
        onMouseOut={() => !isMobileDevice() && onMouseOut()}
      >
        <PiMapPinDuotone style={{ color: 'var(--color-success)' }}/>
      </div>
    </OverlayView>
  );
};

// Memoize with custom comparison
export default React.memo(MapMarker, (prevProps, nextProps) => {
  return (
    prevProps.marker._id === nextProps.marker._id &&
    prevProps.marker.position.lat === nextProps.marker.position.lat &&
    prevProps.marker.position.lng === nextProps.marker.position.lng
  );
});
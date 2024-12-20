import { OverlayView } from '@react-google-maps/api';
import { Drop } from '../types';
import { PiMapPinDuotone } from "react-icons/pi";
import { isMobileDevice } from '../utils/device';
import React from 'react';

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
    
    if (isMobileDevice()) {
      onMouseOver(marker, syntheticEvent);
    }
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
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -(height / 2)
      })}
    >
      <div 
        style={{ 
          cursor: 'pointer',
          fontSize: '32px',
          color: '#fffbbd',
          filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.5))',
          transform: 'translateY(-30px) translateX(-16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px'
        }}
        onClick={handleMarkerClick}
        onMouseOver={handleMouseOver}
        onMouseOut={() => !isMobileDevice() && onMouseOut()}
      >
        <PiMapPinDuotone />
      </div>
    </OverlayView>
  );
};

export default MapMarker;
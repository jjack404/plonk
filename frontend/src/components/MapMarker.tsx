import React from 'react';
import { OverlayView } from '@react-google-maps/api';
import { Drop } from '../types';
import { PiMapPinDuotone } from "react-icons/pi";
import { isMobileDevice } from '../utils/device';
import Bullet from '../components/Bullet';

interface MapMarkerProps {
  marker: Drop;
  onMouseOver: (marker: Drop, e: google.maps.MapMouseEvent) => void;
  onMouseOut: () => void;
  onClick: () => void;
}

const MARKER_OFFSET = { x: -16, y: -32 };

const MapMarker: React.FC<MapMarkerProps> = React.memo(({
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
      getPixelPositionOffset={() => MARKER_OFFSET}
    >
      <div 
        onClick={handleMarkerClick}
        onMouseOver={handleMouseOver}
        onMouseOut={() => !isMobileDevice() && onMouseOut()}
      >
        <Bullet 
          icon={<PiMapPinDuotone />} 
          color="var(--color-success)"
          size="medium"
        />
      </div>
    </OverlayView>
  );
});

MapMarker.displayName = 'MapMarker';

export default MapMarker;
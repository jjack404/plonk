import React, { useMemo } from 'react';
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

  const markerStyle = useMemo(() => ({
    cursor: 'pointer',
    fontSize: '32px',
    color: 'var(--color-success)',
    filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.7))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    position: 'relative' as const,
    transform: 'translate3d(0, 0, 0)',
    willChange: 'transform'
  }), []);

  return (
    <OverlayView
      position={marker.position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => MARKER_OFFSET}
    >
      <div 
        style={markerStyle}
        onClick={handleMarkerClick}
        onMouseOver={handleMouseOver}
        onMouseOut={() => !isMobileDevice() && onMouseOut()}
      >
        <PiMapPinDuotone style={{ color: 'var(--color-success)' }}/>
      </div>
    </OverlayView>
  );
});

MapMarker.displayName = 'MapMarker';

export default MapMarker;
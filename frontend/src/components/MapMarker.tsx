import { Marker } from '@react-google-maps/api';
import { Drop } from '../types';
import pepeIcon from '../assets/pepe.png';
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
  const handleMarkerClick = (e: google.maps.MapMouseEvent) => {
    if (isMobileDevice()) {
      // On mobile, trigger both position calculation and click
      onMouseOver(marker, e);
      onClick();
    } else {
      onClick();
    }
  };

  const handleMouseOver = (e: google.maps.MapMouseEvent) => {
    if (!isMobileDevice()) {
      onMouseOver(marker, e);
    }
  };

  return (
    <Marker
      position={marker.position}
      icon={{
        url: pepeIcon,
        scaledSize: new window.google.maps.Size(32, 32),
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={() => !isMobileDevice() && onMouseOut()}
      onClick={handleMarkerClick}
    />
  );
};

export default MapMarker;
import { Marker } from '@react-google-maps/api';
import { Drop } from '../types';
import pepeIcon from '../assets/pepe.png';

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
}) => (
  <Marker
    position={marker.position}
    icon={{
      url: pepeIcon,
      scaledSize: new window.google.maps.Size(32, 32),
    }}
    onMouseOver={(e: google.maps.MapMouseEvent) => onMouseOver(marker, e)}
    onMouseOut={onMouseOut}
    onClick={onClick}
  />
);

export default MapMarker;
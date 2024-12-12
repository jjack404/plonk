import React, { useEffect, useRef } from 'react';
import './PanoramaView.css';
import { Position } from '../types';

interface PanoramaViewProps {
  position: Position;
  onError?: () => void;
}

const PanoramaView: React.FC<PanoramaViewProps> = ({ position, onError }) => {
  const panoramaRef = useRef<HTMLDivElement>(null);
  const panoramaInstance = useRef<google.maps.StreetViewPanorama | null>(null);

  useEffect(() => {
    if (!panoramaRef.current) return;

    const panorama = new google.maps.StreetViewPanorama(panoramaRef.current, {
      position: { lat: position.lat, lng: position.lng },
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      addressControl: false,
      showRoadLabels: false,
      zoomControl: false,
      fullscreenControl: false,
      panControl: false,
      linksControl: false,
      enableCloseButton: false,
      motionTracking: false,
      motionTrackingControl: false,
      visible: true
    });

    const sv = new google.maps.StreetViewService();
    sv.getPanorama({
      location: { lat: position.lat, lng: position.lng },
      radius: 160,
      source: google.maps.StreetViewSource.OUTDOOR
    }).then(
      (data) => {
        const location = data.data?.location;
        if (location?.pano) {
          panorama.setPano(location.pano);
        }
      },
      (error) => {
        console.error('Street View not available:', error);
        onError?.();
      }
    );

    panoramaInstance.current = panorama;

    return () => {
      if (panoramaInstance.current) {
        const container = panoramaRef.current;
        if (container) {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        }
      }
    };
  }, [position]);

  return <div ref={panoramaRef} className="panorama-view" />;
};

export default PanoramaView;

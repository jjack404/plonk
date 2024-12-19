import { useState, useRef, useEffect } from 'react';
import { Position, Drop } from '../types';
import { isMobileDevice } from '../utils/device';

export const useMapInteractions = (walletAddress: string | null) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formPosition, setFormPosition] = useState<Position | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<Drop | null>(null);
  const [expandedMarker, setExpandedMarker] = useState<Drop | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);

  const updateMarkerPosition = (marker: Drop) => {
    if (!mapRef.current) return;

    const latLng = new google.maps.LatLng(marker.position.lat, marker.position.lng);
    const projection = mapRef.current.getProjection();
    if (!projection) return;

    const scale = Math.pow(2, mapRef.current.getZoom() || 0);
    const worldPoint = projection.fromLatLngToPoint(latLng);
    const topRight = projection.fromLatLngToPoint(mapRef.current.getBounds()?.getNorthEast()!);
    const bottomLeft = projection.fromLatLngToPoint(mapRef.current.getBounds()?.getSouthWest()!);
    
    if (worldPoint && topRight && bottomLeft) {
      const x = (worldPoint.x - bottomLeft.x) * scale;
      const y = (worldPoint.y - topRight.y) * scale;
      setMarkerPosition({ x, y });
    }
  };

  const handleMapClick = (event: google.maps.MapMouseEvent): void => {
    if (isMobileDevice() && walletAddress && event.latLng) {
      setFormPosition({
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      });
    } else {
      setFormPosition(null);
    }
    setExpandedMarker(null);
  };

  const handleMapRightClick = async (event: google.maps.MapMouseEvent): Promise<void> => {
    if (!isMobileDevice() && walletAddress && event.latLng && mapRef.current) {
      try {
        const locationDetails = await getLocationDetails(event.latLng);
        setFormPosition({
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
          city: locationDetails.city,
          country: locationDetails.country
        });
        setShowForm(true);
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }
  };

  const handleMarkerMouseOver = (marker: Drop) => {
    setHoveredMarker(marker);
    updateMarkerPosition(marker);
  };

  useEffect(() => {
    if (mapRef.current && (hoveredMarker || expandedMarker)) {
      const marker = hoveredMarker || expandedMarker;
      if (marker) {
        const listener = mapRef.current.addListener('bounds_changed', () => {
          updateMarkerPosition(marker);
        });
        return () => google.maps.event.removeListener(listener);
      }
    }
  }, [hoveredMarker, expandedMarker]);

  return {
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
  };
};

const getLocationDetails = async (
  latLng: google.maps.LatLng
): Promise<{ city: string; country: string }> => {
  const geocoder = new google.maps.Geocoder();
  const response = await geocoder.geocode({ location: latLng });
  const locationDetails = response.results[0]?.address_components || [];
  
  return {
    city: locationDetails.find(component =>
      component.types.includes('locality'))?.long_name || '',
    country: locationDetails.find(component =>
      component.types.includes('country'))?.long_name || ''
  };
};
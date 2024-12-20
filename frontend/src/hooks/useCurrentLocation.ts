import { useState, useEffect } from 'react';

export const useCurrentLocation = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    let watchId: number;

    const setupLocationWatch = () => {
      if ('geolocation' in navigator) {
        // Get initial position quickly
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error) => console.error('Error getting location:', error),
          { maximumAge: 0, timeout: 5000, enableHighAccuracy: true }
        );

        // Then watch for updates
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error) => console.error('Error watching location:', error),
          { maximumAge: 0, timeout: 5000, enableHighAccuracy: true }
        );
      }
    };

    setupLocationWatch();
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { latitude, longitude };
};

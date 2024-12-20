import { useState, useEffect } from 'react';

export const useCurrentLocation = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    let watchId: number;

    const setupLocationWatch = () => {
      if ('geolocation' in navigator) {
        // Get initial position once
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error) => console.error('Error getting location:', error),
          { 
            maximumAge: 30000, // Allow cached positions up to 30 seconds old
            timeout: 5000,     // Wait up to 5 seconds for a response
            enableHighAccuracy: true 
          }
        );

        // Then watch for updates at a reasonable interval
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error) => console.error('Error watching location:', error),
          { 
            maximumAge: 10000,  // Allow cached positions up to 10 seconds old
            timeout: 5000,      // Wait up to 5 seconds for a response
            enableHighAccuracy: true 
          }
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

import { useState, useEffect } from 'react';
import { isMobileDevice } from '../utils/device';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null
  });

  useEffect(() => {
    const requestLocation = async () => {
      if (!navigator.geolocation) {
        setLocation(prev => ({ ...prev, error: 'Geolocation is not supported' }));
        return;
      }

      try {
        // Request permission explicitly on mobile
        if (isMobileDevice()) {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          if (permission.state === 'denied') {
            setLocation(prev => ({ ...prev, error: 'Location permission denied' }));
            return;
          }
        }

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              error: null
            });
          },
          (error) => {
            setLocation(prev => ({ ...prev, error: error.message }));
          },
          {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
          }
        );

        return () => navigator.geolocation.clearWatch(watchId);
      } catch (error) {
        setLocation(prev => ({ ...prev, error: 'Failed to get location' }));
      }
    };

    requestLocation();
  }, []);

  return location;
};

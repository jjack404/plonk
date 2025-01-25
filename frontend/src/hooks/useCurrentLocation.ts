import { useState, useEffect } from 'react';

interface CachedLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

let cachedLocation: CachedLocation | null = null;
const CACHE_DURATION = 30000; // 30 seconds

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<{latitude: number | null, longitude: number | null}>({
    latitude: null,
    longitude: null
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setIsLoading(false);
      return;
    }

    const getCurrentPosition = () => {
      // Check cache first
      if (cachedLocation && Date.now() - cachedLocation.timestamp < CACHE_DURATION) {
        setLocation({
          latitude: cachedLocation.latitude,
          longitude: cachedLocation.longitude
        });
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          };
          cachedLocation = newLocation;
          setLocation({
            latitude: newLocation.latitude,
            longitude: newLocation.longitude
          });
          setIsLoading(false);
        },
        (error) => {
          setError(error.message);
          setIsLoading(false);
        },
        {
          maximumAge: CACHE_DURATION,
          timeout: 10000,
          enableHighAccuracy: true // Need accuracy for distance calculations
        }
      );
    };

    getCurrentPosition();
  }, []);

  return { ...location, error, isLoading };
};
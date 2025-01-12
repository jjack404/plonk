import { useState, useEffect, useCallback } from 'react';

interface LocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export const useCurrentLocation = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const options: LocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,      // Reduced timeout to 5 seconds
    maximumAge: 10000   // Reduced cache time to 10 seconds
  };

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
    setError(null);
    setIsRetrying(false);
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    console.warn('Location error:', error.message);
    
    if (error.code === error.TIMEOUT && !isRetrying) {
      setIsRetrying(true);
      // Keep previous coordinates if we have them
      return;
    }

    if (!isRetrying) {
      setLatitude(null);
      setLongitude(null);
      setError(error.message);
    }
  }, [isRetrying]);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported');
      return;
    }

    let watchId: number;
    let retryTimeout: NodeJS.Timeout;

    const getCurrentPosition = () => {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      );
    };

    // Initial position request
    getCurrentPosition();

    // Set up watching with more frequent updates
    watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        ...options,
        timeout: 3000,     // Even shorter timeout for continuous updates
        maximumAge: 5000   // More frequent cache refresh
      }
    );

    // If we get a timeout, retry after a short delay
    if (isRetrying) {
      retryTimeout = setTimeout(getCurrentPosition, 2000);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [handleSuccess, handleError, isRetrying]);

  return { latitude, longitude, error };
};
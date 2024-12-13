import { Position } from '../types';

interface LocationImageResult {
  type: 'panorama' | 'static';
  url?: string;
  location?: {
    lat: number;
    lng: number;
    pano?: string;
  };
}

export const getLocationImage = async (position: Position): Promise<LocationImageResult> => {
  const { lat, lng } = position;
  const sv = new google.maps.StreetViewService();

  try {
    // Try street view
    const streetViewResult = await sv.getPanorama({
      location: { lat, lng },
      radius: 160,
      source: google.maps.StreetViewSource.OUTDOOR
    });
    
    const location = streetViewResult.data?.location;
    if (location?.latLng && location.pano) {
      return {
        type: 'panorama',
        location: {
          lat: location.latLng.lat(),
          lng: location.latLng.lng(),
          pano: location.pano
        }
      };
    }

    // Fallback to static map
    return {
      type: 'static',
      url: getStaticMapUrl(lat, lng)
    };
  } catch (error) {
    return {
      type: 'static',
      url: getStaticMapUrl(lat, lng)
    };
  }
};

const getStaticMapUrl = (lat: number, lng: number): string => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=300x150&markers=color:red%7C${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
};

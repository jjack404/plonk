import { Position } from '../types';

interface LocationImageResult {
  type: 'panorama' | 'map';
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
    // First check for photospheres within 50 meters
    const photosphereResult = await sv.getPanorama({
      location: { lat, lng },
      radius: 50,
      source: google.maps.StreetViewSource.OUTDOOR,
      preference: google.maps.StreetViewPreference.BEST
    });

    const photoLocation = photosphereResult.data?.location;
    if (photoLocation?.latLng && photoLocation.pano) {
      return {
        type: 'panorama',
        location: {
          lat: photoLocation.latLng.lat(),
          lng: photoLocation.latLng.lng(),
          pano: photoLocation.pano
        }
      };
    }

    // Then check for street view within 160 meters
    const streetViewResult = await sv.getPanorama({
      location: { lat, lng },
      radius: 160,
      source: google.maps.StreetViewSource.DEFAULT,
      preference: google.maps.StreetViewPreference.NEAREST
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

    // Fallback to map
    return {
      type: 'map',
      location: { lat, lng }
    };
  } catch (error) {
    return {
      type: 'map',
      location: { lat, lng }
    };
  }
};

import { Position } from '../types';

export const getLocationImage = async (position: Position): Promise<string> => {
  const { lat, lng } = position;
  const sv = new google.maps.StreetViewService();

  try {
    // Try street view first
    const streetViewResult = await sv.getPanorama({
      location: { lat, lng },
      radius: 160,
      source: google.maps.StreetViewSource.OUTDOOR
    });
    
    const location = streetViewResult.data?.location;
    if (location?.latLng) {
      return getStreetViewImageUrl(location.latLng.lat(), location.latLng.lng());
    }

    // Then try photo spheres and user contributed photos
    const photoSphereResult = await sv.getPanorama({
      location: { lat, lng },
      radius: 160,
      source: google.maps.StreetViewSource.DEFAULT
    });

    const photoLocation = photoSphereResult.data?.location;
    if (photoLocation?.latLng) {
      return getStreetViewImageUrl(photoLocation.latLng.lat(), photoLocation.latLng.lng());
    }

    // Fallback to static map
    return getStaticMapUrl(lat, lng);
  } catch (error) {
    return getStaticMapUrl(lat, lng);
  }
};

const getStreetViewImageUrl = (lat: number, lng: number): string => {
  return `https://maps.googleapis.com/maps/api/streetview?size=400x200&location=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
};

const getStaticMapUrl = (lat: number, lng: number): string => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=300x150&markers=color:red%7C${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
};

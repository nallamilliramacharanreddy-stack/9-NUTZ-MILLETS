/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Number(distance.toFixed(2));
}

export const STORE_LOCATION = {
  lat: 16.942172,
  lng: 82.079792,
  address: "9 NUTZ MILLETS NEAR YSR STATUE, LN PURAM, GOLLALA MAMIDADA, AP.",
};

export const DELIVERY_RADIUS_KM = 40;

export function isWithinDeliveryRange(lat: number, lng: number): boolean {
  const distance = calculateDistance(
    STORE_LOCATION.lat,
    STORE_LOCATION.lng,
    lat,
    lng
  );
  return distance <= DELIVERY_RADIUS_KM;
}

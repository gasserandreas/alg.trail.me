const EARTH_RADIUS = 6371;

function toRadian(degree) {
  return degree * Math.PI / 180; // eslint-disable-line
}

export function getDistanceForPoint(origin, destination) {
  if (!origin || !destination) {
    return null;
  }

  // return distance in meters
  const lon1 = toRadian(origin.lng);
  const lat1 = toRadian(origin.lat);
  const lon2 = toRadian(destination.lng);
  const lat2 = toRadian(destination.lat);

  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;

  // eslint-disable-next-line
  const a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  return c * EARTH_RADIUS * 1000;
}

export const __testables__ = {
  toRadian,
};

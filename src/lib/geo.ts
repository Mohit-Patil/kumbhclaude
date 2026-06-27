/** Shared geospatial helpers. Pure functions — no map/DOM dependencies. */

export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two coordinates, in meters. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** The `k` points closest to `origin`, ordered nearest-first. */
export function nearestK<T extends LatLng>(origin: LatLng, points: T[], k: number): T[] {
  if (k <= 0) return [];
  return points
    .map((p) => ({ p, d: haversineMeters(origin, p) }))
    .sort((x, y) => x.d - y.d)
    .slice(0, k)
    .map((x) => x.p);
}

/** Points strictly within `radiusMeters` of `center`. */
export function withinRadius<T extends LatLng>(
  center: LatLng,
  points: T[],
  radiusMeters: number,
): T[] {
  if (radiusMeters <= 0) return [];
  return points.filter((p) => haversineMeters(center, p) <= radiusMeters);
}

export type ProximityPair<M extends LatLng, F extends LatLng> = {
  missing: M;
  found: F;
  meters: number;
};

/**
 * Every missing/found pair whose pins are within `thresholdMeters` of each other,
 * sorted by ascending distance — a spatial hint for a possible match.
 */
export function proximityPairs<M extends LatLng, F extends LatLng>(
  missing: M[],
  found: F[],
  thresholdMeters: number,
): ProximityPair<M, F>[] {
  const pairs: ProximityPair<M, F>[] = [];
  for (const m of missing) {
    for (const f of found) {
      const meters = haversineMeters(m, f);
      if (meters <= thresholdMeters) pairs.push({ missing: m, found: f, meters });
    }
  }
  return pairs.sort((a, b) => a.meters - b.meters);
}

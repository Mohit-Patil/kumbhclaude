/**
 * Turns a selected missing-person location into an operator search plan:
 * which cameras to pull, which police station to coordinate with, and which
 * choke points fall inside the search ring. Pure — composes the geo helpers.
 */
import { nearestK, withinRadius, haversineMeters, type LatLng } from "./geo";
import { CCTV, POLICE, CHOKE_POINTS, type InfraPoint, type ChokePoint } from "./mapData";

export type SearchPlanOptions = { radiusMeters: number; cameraCount: number };

export type SearchPlanData = {
  cameras: InfraPoint[];
  police: InfraPoint[];
  chokes: Array<InfraPoint & { category: string }>;
};

export type SearchPlan = {
  cameras: Array<InfraPoint & { meters: number }>;
  nearestPolice: (InfraPoint & { meters: number }) | null;
  chokesInRange: Array<InfraPoint & { category: string; meters: number }>;
};

const DEFAULT_DATA: SearchPlanData = { cameras: CCTV, police: POLICE, chokes: CHOKE_POINTS };

const withMeters = <T extends LatLng>(center: LatLng, p: T) => ({
  ...p,
  meters: Math.round(haversineMeters(center, p)),
});

export function buildSearchPlan(
  center: LatLng,
  { radiusMeters, cameraCount }: SearchPlanOptions,
  data: SearchPlanData = DEFAULT_DATA,
): SearchPlan {
  const cameras = nearestK(center, data.cameras, cameraCount).map((c) => withMeters(center, c));
  const nearestPolice = nearestK(center, data.police, 1).map((p) => withMeters(center, p))[0] ?? null;
  const chokesInRange = withinRadius(center, data.chokes, radiusMeters)
    .map((c) => withMeters(center, c) as ChokePoint & { meters: number })
    .sort((a, b) => a.meters - b.meters);
  return { cameras, nearestPolice, chokesInRange };
}

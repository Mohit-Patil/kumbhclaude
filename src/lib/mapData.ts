/** Typed accessors over the bundled GeoJSON in `src/data/`. */
import cctvRaw from "@/data/cctv.json";
import policeRaw from "@/data/police.json";
import chokeRaw from "@/data/chokepoints.json";

export type InfraPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type ChokePoint = InfraPoint & {
  category: string;
  risk?: string;
  riskWeight?: number;
  note?: string;
};

type GeoFeature = {
  geometry: { coordinates: [number, number] };
  properties: Record<string, string | number | undefined>;
};
type GeoCollection = { features: GeoFeature[] };

function toPoints(raw: unknown, prefix: string): InfraPoint[] {
  return (raw as GeoCollection).features.map((f, i) => ({
    id: `${prefix}-${i}`,
    name: String(f.properties.name ?? "Unnamed"),
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }));
}

export const CCTV: InfraPoint[] = toPoints(cctvRaw, "cctv");
export const POLICE: InfraPoint[] = toPoints(policeRaw, "police");

/** Categories that are parking rather than active crowd choke points. */
const PARKING_CATEGORIES = new Set(["Parking", "Outer parking", "Parking belt"]);

export const CHOKE_POINTS: ChokePoint[] = (chokeRaw as unknown as GeoCollection).features.map((f, i) => ({
  id: `choke-${i}`,
  name: String(f.properties.name ?? "Unnamed"),
  lng: f.geometry.coordinates[0],
  lat: f.geometry.coordinates[1],
  category: String(f.properties.category ?? "Unknown"),
  risk: f.properties.risk != null ? String(f.properties.risk) : undefined,
  riskWeight: f.properties.riskWeight != null ? Number(f.properties.riskWeight) : undefined,
  note: f.properties.note != null ? String(f.properties.note) : undefined,
}));

export const isParking = (c: ChokePoint) => PARKING_CATEGORIES.has(c.category);

/** Color a choke point by its risk level (used for marker fill). */
export function riskColor(risk: string | undefined): string {
  switch ((risk ?? "").toLowerCase()) {
    case "very high":
      return "#a82618";
    case "high":
      return "#d33a2c";
    case "medium":
      return "#f2a310";
    default:
      return "#8a9690";
  }
}

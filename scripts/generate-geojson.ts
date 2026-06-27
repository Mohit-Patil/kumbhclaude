/**
 * Build-time: parse the KML datasets in `kmp/` into bundled GeoJSON under `src/data/`.
 * Run with `npm run geojson`. Output is committed so the app never parses KML at runtime.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parsePointPlacemarks, parseChokeMeta } from "../src/lib/kml";

const KMP = join(process.cwd(), "kmp");
const OUT = join(process.cwd(), "src", "data");
mkdirSync(OUT, { recursive: true });

type Props = Record<string, string | number>;
type Feature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: Props;
};

function feature(lng: number, lat: number, properties: Props): Feature {
  return { type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties };
}

function collection(features: Feature[]) {
  return { type: "FeatureCollection" as const, features };
}

const RISK_WEIGHT: Record<string, number> = {
  "very high": 1, high: 0.7, medium: 0.4, low: 0.2,
};

function build(file: string, map: (p: ReturnType<typeof parsePointPlacemarks>[number]) => Props) {
  const kml = readFileSync(join(KMP, file), "utf8");
  return parsePointPlacemarks(kml).map((p) => feature(p.lng, p.lat, map(p)));
}

// CCTV cameras — points only (zone-boundary polygons are skipped by the parser).
const cctv = build("CCTV Dataset.kml", (p) => ({ name: p.name }));

// Police stations.
const police = build("Police Stations.kml", (p) => ({ name: p.name }));

// Choke points + parking — carry category/risk for color grading and the heatmap.
const chokepoints = build("nashik_kumbh_chokepoints_parking_map.kml", (p) => {
  const meta = parseChokeMeta(p.description ?? "");
  const props: Props = { name: p.name };
  if (meta.category) props.category = meta.category;
  if (meta.risk) {
    props.risk = meta.risk;
    props.riskWeight = RISK_WEIGHT[meta.risk.toLowerCase()] ?? 0.3;
  }
  if (meta.note) props.note = meta.note;
  if (meta.source) props.source = meta.source;
  return props;
});

const datasets: [string, Feature[]][] = [
  ["cctv", cctv],
  ["police", police],
  ["chokepoints", chokepoints],
];

for (const [name, features] of datasets) {
  writeFileSync(join(OUT, `${name}.json`), JSON.stringify(collection(features)) + "\n");
  console.log(`${name}: ${features.length} features`);
}

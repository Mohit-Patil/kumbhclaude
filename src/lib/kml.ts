/**
 * Minimal, dependency-free KML parsing for the datasets in `kmp/`.
 * Pure string functions so the generation script and tests share one implementation.
 */

export type PointPlacemark = {
  name: string;
  lat: number;
  lng: number;
  description?: string;
};

function decodeXml(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function tagContent(block: string, tag: string): string | undefined {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1] : undefined;
}

/** Extract every `<Placemark>` that carries a single `<Point>` (cameras, stations, nodes). */
export function parsePointPlacemarks(kml: string): PointPlacemark[] {
  const placemarks = kml.match(/<Placemark\b[\s\S]*?<\/Placemark>/gi) ?? [];
  const out: PointPlacemark[] = [];

  for (const pm of placemarks) {
    const point = tagContent(pm, "Point");
    if (!point) continue; // skip Polygon / LineString placemarks

    const coords = tagContent(point, "coordinates");
    if (!coords) continue;

    const [lngStr, latStr] = coords.trim().split(/[\s,]+/);
    const lng = Number(lngStr);
    const lat = Number(latStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

    const nameRaw = tagContent(pm, "name");
    const descRaw = tagContent(pm, "description");
    out.push({
      name: nameRaw ? decodeXml(nameRaw) : "Unnamed",
      lat,
      lng,
      ...(descRaw ? { description: decodeXml(descRaw) } : {}),
    });
  }

  return out;
}

export type ChokeMeta = {
  category?: string;
  status?: string;
  risk?: string;
  source?: string;
  note?: string;
};

/** Parse the `Key: value | Key: value` description used by the choke-point dataset. */
export function parseChokeMeta(description: string): ChokeMeta {
  const meta: ChokeMeta = {};
  const field = (label: string): string | undefined => {
    const m = description.match(new RegExp(`${label}:\\s*([^|]+?)(?:\\s*\\||$)`, "i"));
    return m ? m[1].trim() : undefined;
  };
  const category = field("Category");
  const status = field("Status");
  const risk = field("Risk");
  const source = field("Source");
  const note = field("Note");
  if (category) meta.category = category;
  if (status) meta.status = status;
  if (risk) meta.risk = risk;
  if (source) meta.source = source;
  if (note) meta.note = note;
  return meta;
}

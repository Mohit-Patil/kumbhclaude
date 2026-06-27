# Operator Geospatial Console — Design

**Date:** 2026-06-27
**Status:** Approved (user authorized implementation)
**Feature branch:** `worktree-operator-map`

## Problem

Punarmilan reunites people separated at the Nashik Kumbh. Today a report knows only
*which booth/zone* it came from — there is no geography. Operators in the control room
cannot see *where* on the map a person was last reported, nor relate that location to the
city infrastructure that actually finds people: CCTV cameras, police stations, and the
traffic choke points where crowds drift and families get separated.

Three KML datasets were uploaded:

- **CCTV Dataset** — 4,141 camera points across Nashik.
- **Police Stations** — 14 points.
- **Choke points & parking** — 85 points, each tagged with `category`
  (traffic choke point, parking, transfer node, no-vehicle pressure zone, etc.) and a
  `risk` level parsed from the description.

## Goal

A command-center map at `/map` that overlays the three datasets plus live report pins, and
turns the result into a *search strategy* for operators.

## Primary user

**Command-center operators** (the existing dashboard audience).

## Non-goals (future scope)

- Per-person precise "last seen" pin capture on the report form (we use booth coordinates).
- Live CCTV video feeds / Street View deep links.
- Mobile field-volunteer view.
- Pre-event planning heatmap tooling beyond the live risk heatmap.

## Architecture

Three data sources feed one client-rendered map:

1. **Static infrastructure** — CCTV / police / choke points parsed once from KML into
   bundled GeoJSON. No runtime parsing of the 30k-line CCTV file.
2. **Live reports** — open missing/found pulled from Supabase (server component), located
   via their booth's coordinates.
3. **Derived intelligence** — search rings, risk heatmap, and proximity alerts computed
   client-side (pure functions) from the above.

### Components / units

- `scripts/kml-to-geojson.mjs` — build-time parser. Reads `kmp/*.kml`, emits
  `src/data/{cctv,police,chokepoints}.json` as GeoJSON FeatureCollections. For choke
  points, extracts `category` and `risk` from the description text. Committed to the repo.
- DB migration — add `lat double precision`, `lng double precision` to `booth`; seed the
  7 existing booths (K-02, K-07, K-08, K-14, K-21, K-31, M-3) with approximate Nashik
  Kumbh ghat-area coordinates.
- `src/lib/geo.ts` — pure functions: `haversineMeters`, `nearestK`, `withinRadius`,
  `proximityPairs`. Unit-tested with Vitest (TDD).
- `src/lib/queries.ts` — add `getMapReports()` → open missing + found with
  `{ id, kind, lat, lng, label, meta, booth }`. Skips reports whose booth has no coords.
- `src/app/map/page.tsx` — server component. Fetches reports, passes them + imported
  GeoJSON to the client map.
- `src/components/map/*` — client components: `OperatorMap` (the `@vis.gl/react-google-maps`
  shell + state), `LayerToggles`, `ReportList`, `SearchPlanPanel`, `ProximityAlerts`.

### Map engine

Google Maps JavaScript API via `@vis.gl/react-google-maps`, keyed by
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Marker clustering for the 4,141 CCTV points. No key →
graceful placeholder telling the operator to set the key (no broken map).

## Features (v1, all four)

1. **Layer toggles** — CCTV (clustered), Police, Choke points (color-graded by risk),
   Parking, Missing pins (red), Found pins (green).
2. **Select-person search ring** — selecting an open missing report draws a radius circle
   around its booth and computes: N nearest CCTV cameras to review, nearest police station
   for handoff, and choke points inside the ring. Renders a "Search plan" panel and
   highlights the relevant markers.
3. **Risk heatmap** — `HeatmapLayer` weighted by choke-point risk, toggleable.
4. **Proximity alerts** — client-side pairwise distance between open found and open missing
   pins; pairs within ~200 m surface as "possible spatial match" hints.

## Data flow

`/map` (server) → fetch reports from Supabase → render `<OperatorMap reports geojson />`
(client). Static GeoJSON is imported directly (bundled). All derived intelligence runs in
the browser from serializable props.

## Error handling

- Missing `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` → placeholder panel, rest of page intact.
- Booth without coordinates → report omitted from map, listed in a "no location" notice.
- KML parser validates coordinate ranges (lng −180..180, lat −90..90) and skips bad points.

## Testing

- TDD on `src/lib/geo.ts` (haversine distances, nearest-K ordering, radius membership,
  proximity pairing + thresholds).
- A focused test on the choke-point description parser (category + risk extraction).
- Map rendering verified via `next build` + manual visual check.

## Coordinate seed (approximate, Nashik Kumbh / Godavari ghat area)

Booths are seeded around Ramkund / Panchavati / Tapovan (~19.99 N, 73.79 E). Exact survey
coordinates can replace these later without code changes.

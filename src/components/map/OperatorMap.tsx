"use client";

import { useEffect, useMemo, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import type { MapReport, BoothPin } from "@/lib/queries";
import { proximityPairs } from "@/lib/geo";
import { buildSearchPlan } from "@/lib/searchPlan";
import { textFilterMissing } from "@/lib/mapSearchFilter";
import { searchMissingPersons } from "@/app/map/searchAction";
import { Avatar } from "@/components/avatar";
import { CctvLayer } from "./CctvLayer";
import { HeatmapLayer } from "./HeatmapLayer";
import { ChokeLayer } from "./ChokeLayer";
import { PoliceLayer } from "./PoliceLayer";
import { BoothLayer } from "./BoothLayer";
import { ReportLayer } from "./ReportLayer";
import { SearchRing } from "./SearchRing";

const KUMBH_CENTER = { lat: 19.9974, lng: 73.7898 }; // Ramkund / Panchavati ghats
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";
const PROXIMITY_THRESHOLD_M = 250;
const CAMERA_COUNT = 6;

type Layers = {
  booths: boolean;
  cctv: boolean;
  police: boolean;
  choke: boolean;
  parking: boolean;
  missing: boolean;
  found: boolean;
  heatmap: boolean;
};

/** A rail result: AI gives score+reason; the text fallback gives score=null. */
type RailResult = { id: string; score: number | null; reason: string };

const DEFAULT_LAYERS: Layers = {
  booths: true,
  cctv: false,
  police: true,
  choke: true,
  parking: false,
  missing: true,
  found: true,
  heatmap: false,
};

/** Pans the map when a missing report is selected. */
function MapController({ target }: { target: MapReport | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && target) {
      map.panTo({ lat: target.lat, lng: target.lng });
      if ((map.getZoom() ?? 0) < 15) map.setZoom(15);
    }
  }, [map, target]);
  return null;
}

export function OperatorMap({
  missing,
  found,
  booths,
  apiKey,
}: {
  missing: MapReport[];
  found: MapReport[];
  booths: BoothPin[];
  apiKey: string | undefined;
}) {
  const [layers, setLayers] = useState<Layers>(DEFAULT_LAYERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [radius, setRadius] = useState(500);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RailResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchNote, setSearchNote] = useState<string | null>(null);

  const highlightIds = useMemo(
    () => (results ? new Set(results.map((r) => r.id)) : null),
    [results],
  );
  // NB: `Map` is shadowed by the vis.gl <Map> import, so use a plain record here.
  const missingById = useMemo(() => {
    const byId: Record<string, MapReport> = {};
    for (const m of missing) byId[m.id] = m;
    return byId;
  }, [missing]);

  const selected = useMemo(
    () => missing.find((m) => m.id === selectedId) ?? null,
    [missing, selectedId],
  );

  const plan = useMemo(
    () =>
      selected
        ? buildSearchPlan(
            { lat: selected.lat, lng: selected.lng },
            { radiusMeters: radius, cameraCount: CAMERA_COUNT },
          )
        : null,
    [selected, radius],
  );

  const pairs = useMemo(
    () => proximityPairs(missing, found, PROXIMITY_THRESHOLD_M),
    [missing, found],
  );

  if (!apiKey) {
    return (
      <div className="map-missing-key">
        <h2>Map unavailable</h2>
        <p>
          Set <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code>.env.local</code> (Maps
          JavaScript API enabled) to load the operator map.
        </p>
      </div>
    );
  }

  const toggle = (k: keyof Layers) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setResults(null);
      setSearchNote(null);
      return;
    }
    setSearching(true);
    setSearchNote(null);
    try {
      const r = await searchMissingPersons(q);
      setResults(r.map((x) => ({ id: x.id, score: x.score, reason: x.reason })));
      if (r.length === 0) setSearchNote("No semantic matches for that query.");
    } catch {
      // Graceful fallback: client-side text filter over the loaded reports.
      const items = missing.map((m) => ({
        id: m.id,
        label: m.label,
        meta: [m.boothCode, m.meta].filter(Boolean).join(" · "),
      }));
      const filtered = textFilterMissing(items, q);
      setResults(filtered.map((f) => ({ id: f.id, score: null, reason: "" })));
      setSearchNote("AI search unavailable — showing text matches.");
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setResults(null);
    setSearchNote(null);
  }

  const searchForm = (
    <form className="mapsearch" onSubmit={runSearch} role="search">
      <div className="mapsearch-field">
        <svg
          className="mapsearch-ico"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-3.6-3.6" />
        </svg>
        <input
          type="text"
          placeholder="Search missing people — describe them in any language…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search missing people"
        />
        {query && (
          <button
            type="button"
            className="mapsearch-x"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-primary mapsearch-go" disabled={searching}>
        {searching ? "Searching…" : "Search"}
      </button>
      {(results || searchNote) && (
        <span className="mapsearch-status">
          {results ? `${results.length} match${results.length === 1 ? "" : "es"}` : ""}
          {results && searchNote ? " · " : ""}
          {searchNote ?? ""}
        </span>
      )}
    </form>
  );

  return (
    <APIProvider apiKey={apiKey}>
      <div className="map-shell">
        <aside className="map-rail">
          <section className="map-toggles">
            <h3>Layers</h3>
            {(
              [
                ["missing", "Missing reports"],
                ["found", "Found reports"],
                ["booths", `Help booths (${booths.length})`],
                ["choke", "Choke points"],
                ["parking", "Parking"],
                ["police", "Police stations"],
                ["cctv", "CCTV cameras"],
                ["heatmap", "Risk heatmap"],
              ] as [keyof Layers, string][]
            ).map(([key, label]) => (
              <label key={key} className="map-toggle">
                <input type="checkbox" checked={layers[key]} onChange={() => toggle(key)} />
                {label}
              </label>
            ))}
          </section>

          <section className="map-panel">
            <h3>
              {results ? "Search results" : "Open missing"}{" "}
              <span className="ct">{results ? results.length : missing.length}</span>
            </h3>
            {!results && (
              <p className="map-hint">Use the search bar above, or pick a person to plan a search.</p>
            )}

            <div className="map-list">
              {results
                ? results.map((res) => {
                    const r = missingById[res.id];
                    if (!r) return null;
                    return (
                      <button
                        key={res.id}
                        className={`map-listitem withthumb ${res.id === selectedId ? "active" : ""}`}
                        onClick={() => setSelectedId(res.id === selectedId ? null : res.id)}
                      >
                        <span className="map-thumb av-silhouette">
                          <Avatar url={r.photo} size={16} />
                        </span>
                        <span className="nm">{r.label}</span>
                        <span className="mt">
                          {res.reason || [r.boothCode, r.meta].filter(Boolean).join(" · ")}
                        </span>
                        {res.score != null && (
                          <span className="ago">{Math.round(res.score * 100)}%</span>
                        )}
                      </button>
                    );
                  })
                : missing.map((r) => (
                    <button
                      key={r.id}
                      className={`map-listitem withthumb ${r.id === selectedId ? "active" : ""}`}
                      onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
                    >
                      <span className="map-thumb av-silhouette">
                        <Avatar url={r.photo} size={16} />
                      </span>
                      <span className="nm">{r.label}</span>
                      <span className="mt">{[r.boothCode, r.meta].filter(Boolean).join(" · ")}</span>
                      <span className="ago">{r.ago}</span>
                    </button>
                  ))}
              {results && results.length === 0 && (
                <div className="map-hint">No matches — try different words.</div>
              )}
              {!results && missing.length === 0 && (
                <div className="map-hint">No open missing reports.</div>
              )}
            </div>
          </section>

          {selected && plan && (
            <section className="map-panel plan">
              <h3>Search plan · {selected.label}</h3>
              <label className="map-radius">
                Ring radius
                <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
                  <option value={300}>300 m</option>
                  <option value={500}>500 m</option>
                  <option value={800}>800 m</option>
                </select>
              </label>
              <ul className="plan-list">
                <li>
                  <b>{plan.cameras.length}</b> nearest cameras to review
                  {plan.cameras[0] && <span className="sub"> · closest {plan.cameras[0].meters} m</span>}
                </li>
                <li>
                  Handoff:{" "}
                  <b>{plan.nearestPolice ? plan.nearestPolice.name : "none nearby"}</b>
                  {plan.nearestPolice && <span className="sub"> · {plan.nearestPolice.meters} m</span>}
                </li>
                <li>
                  <b>{plan.chokesInRange.length}</b> choke point
                  {plan.chokesInRange.length === 1 ? "" : "s"} in range (likely drift)
                </li>
              </ul>
            </section>
          )}

          <section className="map-panel">
            <h3>
              Proximity alerts <span className="ct">{pairs.length}</span>
            </h3>
            <p className="map-hint">Found pins near open missing pins (≤ {PROXIMITY_THRESHOLD_M} m).</p>
            <div className="map-list">
              {pairs.slice(0, 8).map((p) => (
                <button
                  key={`${p.missing.id}-${p.found.id}`}
                  className="map-listitem alert"
                  onClick={() => setSelectedId(p.missing.id)}
                >
                  <span className="nm">
                    {p.missing.label} ↔ {p.found.label}
                  </span>
                  <span className="mt">possible spatial match</span>
                  <span className="ago">{p.meters} m</span>
                </button>
              ))}
              {pairs.length === 0 && <div className="map-hint">No nearby pairs right now.</div>}
            </div>
          </section>
        </aside>

        <div className="map-canvas">
          {searchForm}
          <Map
            mapId={MAP_ID}
            defaultCenter={KUMBH_CENTER}
            defaultZoom={14}
            gestureHandling="greedy"
            disableDefaultUI={false}
            clickableIcons={false}
          >
            <CctvLayer visible={layers.cctv} />
            <HeatmapLayer visible={layers.heatmap} />
            <ChokeLayer showChoke={layers.choke} showParking={layers.parking} />
            <PoliceLayer visible={layers.police} />
            <BoothLayer booths={booths} visible={layers.booths} />
            <ReportLayer
              missing={missing}
              found={found}
              showMissing={layers.missing}
              showFound={layers.found}
              selectedId={selectedId}
              highlightIds={highlightIds}
              onSelectMissing={(r) => setSelectedId(r.id === selectedId ? null : r.id)}
            />
            {selected && plan && (
              <SearchRing center={{ lat: selected.lat, lng: selected.lng }} radiusMeters={radius} plan={plan} />
            )}
            <MapController target={selected} />
          </Map>
        </div>
      </div>
    </APIProvider>
  );
}

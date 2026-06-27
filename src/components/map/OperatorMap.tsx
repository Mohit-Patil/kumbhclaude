"use client";

import { useEffect, useMemo, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import type { MapReport, BoothPin } from "@/lib/queries";
import { proximityPairs } from "@/lib/geo";
import { buildSearchPlan } from "@/lib/searchPlan";
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
              Open missing <span className="ct">{missing.length}</span>
            </h3>
            <p className="map-hint">Select a person to build a search plan.</p>
            <div className="map-list">
              {missing.map((r) => (
                <button
                  key={r.id}
                  className={`map-listitem ${r.id === selectedId ? "active" : ""}`}
                  onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
                >
                  <span className="nm">{r.label}</span>
                  <span className="mt">{[r.boothCode, r.meta].filter(Boolean).join(" · ")}</span>
                  <span className="ago">{r.ago}</span>
                </button>
              ))}
              {missing.length === 0 && <div className="map-hint">No open missing reports.</div>}
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

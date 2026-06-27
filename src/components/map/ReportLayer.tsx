"use client";

import { useState } from "react";
import { AdvancedMarker, InfoWindow, Pin } from "@vis.gl/react-google-maps";
import type { MapReport } from "@/lib/queries";

/** Missing (red) and found (green) report pins, located via their booth. */
export function ReportLayer({
  missing,
  found,
  showMissing,
  showFound,
  selectedId,
  onSelectMissing,
}: {
  missing: MapReport[];
  found: MapReport[];
  showMissing: boolean;
  showFound: boolean;
  selectedId: string | null;
  onSelectMissing: (r: MapReport) => void;
}) {
  const [activeFound, setActiveFound] = useState<MapReport | null>(null);

  return (
    <>
      {showMissing &&
        missing.map((r) => {
          const selected = r.id === selectedId;
          return (
            <AdvancedMarker
              key={r.id}
              position={{ lat: r.lat, lng: r.lng }}
              title={`Missing · ${r.label}`}
              zIndex={selected ? 1000 : undefined}
              onClick={() => onSelectMissing(r)}
            >
              <Pin
                background="#d33a2c"
                borderColor={selected ? "#16302b" : "#ffffff"}
                glyphColor="#ffffff"
                scale={selected ? 1.4 : 1}
              />
            </AdvancedMarker>
          );
        })}

      {showFound &&
        found.map((r) => (
          <AdvancedMarker
            key={r.id}
            position={{ lat: r.lat, lng: r.lng }}
            title={`Found · ${r.label}`}
            onClick={() => setActiveFound(r)}
          >
            <Pin background="#0e7c6b" borderColor="#ffffff" glyphColor="#ffffff" />
          </AdvancedMarker>
        ))}

      {activeFound && (
        <InfoWindow
          position={{ lat: activeFound.lat, lng: activeFound.lng }}
          onCloseClick={() => setActiveFound(null)}
        >
          <div style={{ fontSize: 12.5, maxWidth: 220 }}>
            <strong>{activeFound.label}</strong>
            <div style={{ color: "#0a574b" }}>Found · {activeFound.ago} ago</div>
            {activeFound.meta && <div style={{ color: "#52635d" }}>{activeFound.meta}</div>}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

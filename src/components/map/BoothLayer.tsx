"use client";

import { useState } from "react";
import { AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import type { BoothPin } from "@/lib/queries";

/** Help booths — the reunification network. Pilgrims report and collect here. */
export function BoothLayer({ booths, visible }: { booths: BoothPin[]; visible: boolean }) {
  const [active, setActive] = useState<BoothPin | null>(null);
  if (!visible) return null;

  return (
    <>
      {booths.map((b) => (
        <AdvancedMarker
          key={b.id}
          position={{ lat: b.lat, lng: b.lng }}
          title={`${b.code ? b.code + " · " : ""}${b.name}`}
          onClick={() => setActive(b)}
        >
          <span className="booth-marker" aria-hidden>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M12 3 3 9v11h6v-6h6v6h6V9z" fill="#fff" />
            </svg>
          </span>
        </AdvancedMarker>
      ))}

      {active && (
        <InfoWindow
          position={{ lat: active.lat, lng: active.lng }}
          onCloseClick={() => setActive(null)}
        >
          <div style={{ fontSize: 12.5, maxWidth: 200 }}>
            <strong>{active.code ? `${active.code} · ` : ""}{active.name}</strong>
            <div style={{ color: "#C97D00" }}>Help booth{active.zone ? ` · ${active.zone}` : ""}</div>
            {active.phone && (
              <div style={{ color: "#52635d", fontFamily: "var(--font-mono, monospace)" }}>
                {active.phone}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

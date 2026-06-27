"use client";

import { useState } from "react";
import { AdvancedMarker, InfoWindow, Pin } from "@vis.gl/react-google-maps";
import { POLICE, type InfraPoint } from "@/lib/mapData";

/** Police stations — reunification handoff / escalation points. */
export function PoliceLayer({ visible }: { visible: boolean }) {
  const [active, setActive] = useState<InfraPoint | null>(null);
  if (!visible) return null;

  return (
    <>
      {POLICE.map((p) => (
        <AdvancedMarker
          key={p.id}
          position={{ lat: p.lat, lng: p.lng }}
          title={p.name}
          onClick={() => setActive(p)}
        >
          <Pin background="#3949ab" borderColor="#ffffff" glyphColor="#ffffff" />
        </AdvancedMarker>
      ))}

      {active && (
        <InfoWindow position={{ lat: active.lat, lng: active.lng }} onCloseClick={() => setActive(null)}>
          <div style={{ fontSize: 12.5 }}>
            <strong>{active.name}</strong>
            <div style={{ color: "#52635d" }}>Police station</div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

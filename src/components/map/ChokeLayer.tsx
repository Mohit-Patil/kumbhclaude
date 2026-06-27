"use client";

import { useState } from "react";
import { AdvancedMarker, InfoWindow, Pin } from "@vis.gl/react-google-maps";
import { CHOKE_POINTS, isParking, riskColor, type ChokePoint } from "@/lib/mapData";

/** Choke points (crowd risk) and, optionally, parking — color-graded by risk. */
export function ChokeLayer({
  showChoke,
  showParking,
}: {
  showChoke: boolean;
  showParking: boolean;
}) {
  const [active, setActive] = useState<ChokePoint | null>(null);

  const points = CHOKE_POINTS.filter((c) => {
    const parking = isParking(c);
    return parking ? showParking : showChoke;
  });

  return (
    <>
      {points.map((c) => {
        const parking = isParking(c);
        const color = parking ? "#0e7c6b" : riskColor(c.risk);
        return (
          <AdvancedMarker
            key={c.id}
            position={{ lat: c.lat, lng: c.lng }}
            title={c.name}
            onClick={() => setActive(c)}
          >
            <Pin background={color} borderColor="#ffffff" glyphColor="#ffffff" scale={parking ? 0.7 : 0.9} />
          </AdvancedMarker>
        );
      })}

      {active && (
        <InfoWindow position={{ lat: active.lat, lng: active.lng }} onCloseClick={() => setActive(null)}>
          <div style={{ maxWidth: 240, fontSize: 12.5, lineHeight: 1.4 }}>
            <strong>{active.name}</strong>
            <div style={{ color: "#52635d" }}>{active.category}</div>
            {active.risk && (
              <div>
                Risk: <b style={{ color: riskColor(active.risk) }}>{active.risk}</b>
              </div>
            )}
            {active.note && <div style={{ marginTop: 4, color: "#52635d" }}>{active.note}</div>}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

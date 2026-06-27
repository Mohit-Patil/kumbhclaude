"use client";

import { AdvancedMarker, Circle, Pin } from "@vis.gl/react-google-maps";
import type { LatLng } from "@/lib/geo";
import type { SearchPlan } from "@/lib/searchPlan";

/** The radius ring plus highlighted cameras-to-review and the handoff police station. */
export function SearchRing({
  center,
  radiusMeters,
  plan,
}: {
  center: LatLng;
  radiusMeters: number;
  plan: SearchPlan;
}) {
  return (
    <>
      <Circle
        center={center}
        radius={radiusMeters}
        strokeColor="#a82618"
        strokeOpacity={0.8}
        strokeWeight={2}
        fillColor="#d33a2c"
        fillOpacity={0.08}
      />

      {plan.cameras.map((c) => (
        <AdvancedMarker key={`ring-${c.id}`} position={{ lat: c.lat, lng: c.lng }} title={`Review CCTV · ${c.name}`}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#1976d2",
              border: "3px solid #fff",
              boxShadow: "0 0 0 2px #1976d2",
            }}
          />
        </AdvancedMarker>
      ))}

      {plan.nearestPolice && (
        <AdvancedMarker
          position={{ lat: plan.nearestPolice.lat, lng: plan.nearestPolice.lng }}
          title={`Handoff · ${plan.nearestPolice.name}`}
        >
          <Pin background="#3949ab" borderColor="#16302b" glyphColor="#ffffff" scale={1.3} />
        </AdvancedMarker>
      )}
    </>
  );
}

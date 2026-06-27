"use client";

import { useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { CHOKE_POINTS } from "@/lib/mapData";

/**
 * The bundled @types/google.maps stub for the (legacy) visualization library only
 * declares an empty class, so we describe the runtime surface we use here.
 */
type WeightedPoint = { location: google.maps.LatLng; weight: number };
type HeatmapInstance = {
  setMap(map: google.maps.Map | null): void;
  setData(data: WeightedPoint[]): void;
  set(key: string, value: unknown): void;
};

/** Separation-risk heatmap, weighted by each choke point's risk level. */
export function HeatmapLayer({ visible }: { visible: boolean }) {
  const map = useMap();
  const vizLib = useMapsLibrary("visualization");

  useEffect(() => {
    if (!map || !vizLib || !visible) return;

    const Ctor = vizLib.HeatmapLayer as unknown as new () => HeatmapInstance;
    const heatmap = new Ctor();
    heatmap.setData(
      CHOKE_POINTS.map((c) => ({
        location: new google.maps.LatLng(c.lat, c.lng),
        weight: c.riskWeight ?? 0.3,
      })),
    );
    heatmap.set("radius", 40);
    heatmap.set("opacity", 0.6);
    heatmap.setMap(map);

    return () => heatmap.setMap(null);
  }, [map, vizLib, visible]);

  return null;
}

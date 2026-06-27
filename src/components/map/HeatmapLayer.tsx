"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { CHOKE_POINTS } from "@/lib/mapData";

/**
 * Separation-risk heatmap.
 *
 * Google REMOVED `google.maps.visualization.HeatmapLayer` in Maps JS API v3.65
 * (deprecated May 2025, unavailable since May 2026) — instantiating it now
 * throws at runtime, which is why the old layer silently did nothing.
 *
 * This replacement is dependency-free and works on vector (`mapId`) maps: each
 * choke point is drawn as a stack of concentric translucent circles. Because
 * the rings share a low opacity and shrink toward the centre, their fills
 * accumulate — the centre (covered by every ring) reads hot, fading smoothly to
 * transparent at the edge. Overlapping choke points blend the same way a real
 * heatmap would. `google.maps.Circle` is part of the core library and is not
 * deprecated.
 */

const RINGS = 7; // concentric circles per point — more rings = smoother falloff
const BASE_RADIUS_M = 340; // outer radius (metres) at risk weight 1

export function HeatmapLayer({ visible }: { visible: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !visible) return;

    const circles: google.maps.Circle[] = [];
    for (const c of CHOKE_POINTS) {
      const weight = c.riskWeight ?? 0.3;
      const maxRadius = BASE_RADIUS_M * (0.55 + 0.9 * weight);
      // Draw outermost (cool) first so the hot centre stacks on top.
      for (let i = RINGS; i >= 1; i--) {
        const t = i / RINGS; // 1 at the edge → ~0.14 at the centre
        const color = t > 0.66 ? "#fdd835" : t > 0.33 ? "#fb8c00" : "#e53935";
        circles.push(
          new google.maps.Circle({
            map,
            center: { lat: c.lat, lng: c.lng },
            radius: maxRadius * t,
            strokeWeight: 0,
            fillColor: color,
            fillOpacity: 0.13,
            clickable: false,
          }),
        );
      }
    }

    return () => circles.forEach((circle) => circle.setMap(null));
  }, [map, visible]);

  return null;
}

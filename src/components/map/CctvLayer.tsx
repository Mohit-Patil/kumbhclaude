"use client";

import { useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { CCTV } from "@/lib/mapData";

/**
 * 4k+ camera points, rendered imperatively and clustered for performance.
 * Plain google.maps.Marker is intentional here — AdvancedMarker per point would
 * mount thousands of React nodes.
 */
export function CctvLayer({ visible }: { visible: boolean }) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");

  useEffect(() => {
    if (!map || !markerLib || !visible) return;

    const markers = CCTV.map(
      (c) =>
        new markerLib.Marker({
          position: { lat: c.lat, lng: c.lng },
          title: `CCTV · ${c.name}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3.2,
            fillColor: "#1976d2",
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 1,
          },
        }),
    );

    const clusterer = new MarkerClusterer({ map, markers });

    return () => {
      clusterer.clearMarkers();
      clusterer.setMap(null);
      markers.forEach((m) => m.setMap(null));
    };
  }, [map, markerLib, visible]);

  return null;
}

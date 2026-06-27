"use client";

import { useEffect, useRef, useState } from "react";

// Common Nashik Kumbh Mela locations (along the Godavari, Panchavati and
// Trimbakeshwar) with fixed coordinates. "None of the above" lets the user
// drop a pin manually on a Google map.
type Place = { value: string; name: string; lat: number; lon: number };

const PLACES: Place[] = [
  { value: "ramkund", name: "Ramkund", lat: 19.9981, lon: 73.7906 },
  { value: "panchavati", name: "Panchavati", lat: 20.0069, lon: 73.7903 },
  { value: "kalaram", name: "Kalaram Temple", lat: 19.9994, lon: 73.7906 },
  { value: "sita-gufa", name: "Sita Gufa", lat: 20.0072, lon: 73.7905 },
  { value: "tapovan", name: "Tapovan", lat: 20.019, lon: 73.805 },
  { value: "sadhugram", name: "Sadhugram", lat: 20.015, lon: 73.8 },
  { value: "sundarnarayan", name: "Sundarnarayan Temple", lat: 19.9966, lon: 73.7889 },
  { value: "godavari-ghat", name: "Godavari Ghat", lat: 19.9975, lon: 73.79 },
  { value: "trimbakeshwar", name: "Trimbakeshwar", lat: 19.932, lon: 73.5295 },
  { value: "kushavarta", name: "Kushavarta Kund", lat: 19.9333, lon: 73.5292 },
  { value: "dwarka", name: "Dwarka Circle", lat: 19.976, lon: 73.798 },
  { value: "cbs", name: "Central Bus Stand (CBS)", lat: 19.997, lon: 73.783 },
  { value: "nashik-road", name: "Nashik Road", lat: 19.9483, lon: 73.84 },
];

const OTHER = "other";
const NASHIK_CENTER = { lat: 19.9981, lng: 73.7906 };
const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any;
    __gmapsPromise?: Promise<void>;
  }
}

// Load the Google Maps JS API once, shared across mounts.
function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsPromise) return window.__gmapsPromise;
  window.__gmapsPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return window.__gmapsPromise;
}

type GmapStatus = "idle" | "loading" | "ready" | "error";

export default function LocationField() {
  const [value, setValue] = useState<string>("ramkund");
  const [pin, setPin] = useState<{ lat: number; lon: number } | null>(null);
  const [gmapStatus, setGmapStatus] = useState<GmapStatus>("idle");

  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const isOther = value === OTHER;
  const place = PLACES.find((p) => p.value === value) ?? null;

  // Reset the dropped pin whenever we leave "none of the above".
  useEffect(() => {
    if (!isOther) setPin(null);
  }, [isOther]);

  // Boot an interactive Google map for the manual pin-drop flow.
  useEffect(() => {
    if (!isOther) return;
    if (!GOOGLE_KEY) {
      setGmapStatus("error");
      return;
    }
    let cancelled = false;
    setGmapStatus("loading");
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapEl.current) return;
        const g = window.google;
        const map = new g.maps.Map(mapEl.current, {
          center: NASHIK_CENTER,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        });
        mapRef.current = map;
        map.addListener("click", (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setPin({ lat, lon: lng });
          if (markerRef.current) {
            markerRef.current.setPosition(e.latLng);
          } else {
            markerRef.current = new g.maps.Marker({ position: e.latLng, map });
          }
        });
        setGmapStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setGmapStatus("error");
      });
    return () => {
      cancelled = true;
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isOther]);

  // Coordinates carried with the form: dropped pin, or the chosen place.
  const coords = pin ?? (place ? { lat: place.lat, lon: place.lon } : null);

  const osmSrc = place
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        place.lon - 0.004
      }%2C${place.lat - 0.0025}%2C${place.lon + 0.004}%2C${
        place.lat + 0.0025
      }&layer=mapnik&marker=${place.lat}%2C${place.lon}`
    : null;

  return (
    <div className="field">
      <label>
        Where <span className="hi">स्थान</span>
      </label>
      <select
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {PLACES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.name}
          </option>
        ))}
        <option value={OTHER}>None of the above — drop a pin</option>
      </select>

      <div className="map" style={{ marginTop: 8 }}>
        {isOther ? (
          <>
            {GOOGLE_KEY ? (
              <div ref={mapEl} style={{ position: "absolute", inset: 0 }} />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--teal-deep)",
                }}
              >
                Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local to drop a pin.
              </div>
            )}
            <span className="lbl">
              {gmapStatus === "loading" && "Loading map…"}
              {gmapStatus === "error" && "Google Maps unavailable"}
              {gmapStatus === "ready" &&
                !pin &&
                "Tap the map to drop a pin"}
              {pin && `Dropped pin · ${pin.lat.toFixed(5)}, ${pin.lon.toFixed(5)}`}
            </span>
          </>
        ) : (
          osmSrc &&
          place && (
            <>
              <iframe
                title="Last seen location"
                src={osmSrc}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                loading="lazy"
              />
              <span className="lbl">
                {place.name} · {place.lat.toFixed(5)}, {place.lon.toFixed(5)}
              </span>
            </>
          )
        )}
      </div>

      {coords && (
        <>
          <input type="hidden" name="lastSeenLat" value={coords.lat} />
          <input type="hidden" name="lastSeenLon" value={coords.lon} />
        </>
      )}
    </div>
  );
}

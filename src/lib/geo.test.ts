import { describe, it, expect } from "vitest";
import { haversineMeters, nearestK, withinRadius, proximityPairs } from "./geo";

describe("haversineMeters", () => {
  it("is zero for identical points", () => {
    expect(haversineMeters({ lat: 19.99, lng: 73.79 }, { lat: 19.99, lng: 73.79 })).toBe(0);
  });

  it("computes a known short distance within 1% tolerance", () => {
    // ~111.2 m per 0.001 deg of latitude near the equator/India latitudes.
    const d = haversineMeters({ lat: 19.99, lng: 73.79 }, { lat: 19.991, lng: 73.79 });
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(113);
  });

  it("is symmetric", () => {
    const a = { lat: 19.99, lng: 73.79 };
    const b = { lat: 20.01, lng: 73.82 };
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 6);
  });
});

describe("nearestK", () => {
  const origin = { lat: 0, lng: 0 };
  const points = [
    { id: "far", lat: 0, lng: 0.05 },
    { id: "near", lat: 0, lng: 0.001 },
    { id: "mid", lat: 0, lng: 0.01 },
  ];

  it("returns the k closest points ordered by distance", () => {
    const result = nearestK(origin, points, 2);
    expect(result.map((p) => p.id)).toEqual(["near", "mid"]);
  });

  it("returns all points when k exceeds the count", () => {
    expect(nearestK(origin, points, 99)).toHaveLength(3);
  });

  it("returns an empty array for k <= 0", () => {
    expect(nearestK(origin, points, 0)).toEqual([]);
  });
});

describe("withinRadius", () => {
  const center = { lat: 19.99, lng: 73.79 };
  const points = [
    { id: "in", lat: 19.9905, lng: 73.79 }, // ~55 m
    { id: "out", lat: 19.995, lng: 73.79 }, // ~555 m
  ];

  it("keeps only points inside the radius (meters)", () => {
    const result = withinRadius(center, points, 200);
    expect(result.map((p) => p.id)).toEqual(["in"]);
  });

  it("returns nothing for a zero radius", () => {
    expect(withinRadius(center, points, 0)).toEqual([]);
  });
});

describe("proximityPairs", () => {
  const missing = [{ id: "m1", lat: 19.99, lng: 73.79 }];
  const found = [
    { id: "f1", lat: 19.9905, lng: 73.79 }, // ~55 m -> a pair
    { id: "f2", lat: 19.999, lng: 73.79 }, // ~1 km -> not a pair
  ];

  it("pairs a missing and found report within the threshold", () => {
    const pairs = proximityPairs(missing, found, 200);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].missing.id).toBe("m1");
    expect(pairs[0].found.id).toBe("f1");
    expect(pairs[0].meters).toBeGreaterThan(0);
  });

  it("sorts pairs by ascending distance", () => {
    const f = [
      { id: "fb", lat: 19.9907, lng: 73.79 },
      { id: "fa", lat: 19.9903, lng: 73.79 },
    ];
    const pairs = proximityPairs(missing, f, 500);
    expect(pairs.map((p) => p.found.id)).toEqual(["fa", "fb"]);
  });
});

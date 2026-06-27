import { it, expect } from "vitest";
import { buildSearchPlan } from "./searchPlan";

const center = { lat: 19.99, lng: 73.79 };

const cameras = [
  { id: "c1", name: "near", lat: 19.9902, lng: 73.79 }, // ~22 m
  { id: "c2", name: "mid", lat: 19.992, lng: 73.79 }, // ~222 m
  { id: "c3", name: "far", lat: 19.999, lng: 73.79 }, // ~1 km
];
const police = [
  { id: "p1", name: "Far PS", lat: 19.999, lng: 73.79 },
  { id: "p2", name: "Near PS", lat: 19.9905, lng: 73.79 },
];
const chokes = [
  { id: "k1", name: "in", category: "Traffic choke point", lat: 19.9903, lng: 73.79 },
  { id: "k2", name: "out", category: "Traffic choke point", lat: 19.999, lng: 73.79 },
];

it("returns the nearest cameras ordered by distance, capped at cameraCount", () => {
  const plan = buildSearchPlan(center, { radiusMeters: 300, cameraCount: 2 }, { cameras, police, chokes });
  expect(plan.cameras.map((c) => c.id)).toEqual(["c1", "c2"]);
});

it("picks the single nearest police station", () => {
  const plan = buildSearchPlan(center, { radiusMeters: 300, cameraCount: 2 }, { cameras, police, chokes });
  expect(plan.nearestPolice?.id).toBe("p2");
});

it("includes only choke points inside the ring radius", () => {
  const plan = buildSearchPlan(center, { radiusMeters: 300, cameraCount: 2 }, { cameras, police, chokes });
  expect(plan.chokesInRange.map((c) => c.id)).toEqual(["k1"]);
});

it("returns null police when none exist", () => {
  const plan = buildSearchPlan(center, { radiusMeters: 300, cameraCount: 2 }, { cameras, police: [], chokes });
  expect(plan.nearestPolice).toBeNull();
});

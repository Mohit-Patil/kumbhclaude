import { describe, it, expect } from "vitest";
import { buildSearchPrompt, rankResults, type SearchCandidate } from "./searchPrompt";

const candidates: SearchCandidate[] = [
  {
    id: "m1",
    name: "Kamala Bai",
    age: null,
    ageRange: "65-75",
    gender: "female",
    description: "White saree, walking stick",
    zone: "Sector 4",
  },
  {
    id: "m2",
    name: null,
    age: 7,
    ageRange: null,
    gender: "male",
    description: "लाल टी-शर्ट, नीली पैंट",
    zone: "Sector 2",
  },
];

describe("buildSearchPrompt", () => {
  it("includes the query and every candidate's id and description", () => {
    const prompt = buildSearchPrompt("elderly woman white saree walking stick", candidates);
    expect(prompt).toContain("elderly woman white saree walking stick");
    expect(prompt).toContain("m1");
    expect(prompt).toContain("White saree, walking stick");
    expect(prompt).toContain("m2");
    expect(prompt).toContain("लाल टी-शर्ट, नीली पैंट");
  });

  it("normalizes missing fields (age range, unidentified name)", () => {
    const prompt = buildSearchPrompt("q", candidates);
    expect(prompt).toContain("~65-75");
    expect(prompt).toContain("Unidentified");
  });
});

describe("rankResults", () => {
  const raw = [
    { id: "a", score: 0.2, reason: "weak" },
    { id: "b", score: 0.9, reason: "strong" },
    { id: "c", score: 0.55, reason: "ok" },
  ];

  it("drops results below the threshold and sorts by score descending", () => {
    expect(rankResults(raw, 0.3).map((r) => r.id)).toEqual(["b", "c"]);
  });

  it("defaults to a sensible threshold", () => {
    expect(rankResults(raw).every((r) => r.score >= 0.3)).toBe(true);
  });

  it("returns empty when nothing clears the bar", () => {
    expect(rankResults(raw, 0.95)).toEqual([]);
  });
});

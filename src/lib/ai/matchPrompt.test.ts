import { describe, it, expect } from "vitest";
import { buildMatchInput, renderMatchPrompt, type ScorePartyInput } from "./matchPrompt";

const missing: ScorePartyInput = {
  name: "Aarti Yadav",
  age: 7,
  ageRange: null,
  gender: "female",
  description: "Red frock, two braids",
  zone: "Sector 2",
};
const found: ScorePartyInput = {
  name: null,
  age: null,
  ageRange: "6-8",
  gender: "female",
  description: "लाल कपड़े, छोटी बच्ची",
  zone: "Sector 4",
};

describe("buildMatchInput", () => {
  it("normalizes a known party", () => {
    const out = buildMatchInput(missing, found);
    expect(out.missing).toEqual({
      name: "Aarti Yadav",
      age: "7",
      gender: "female",
      description: "Red frock, two braids",
      zone: "Sector 2",
    });
  });

  it("normalizes an unidentified party (uses age range, fallbacks)", () => {
    const out = buildMatchInput(missing, found);
    expect(out.found.name).toBe("Unidentified");
    expect(out.found.age).toBe("~6-8");
    expect(out.found.description).toBe("लाल कपड़े, छोटी बच्ची");
  });

  it("falls back to 'unknown' when a field is missing", () => {
    const blank: ScorePartyInput = {
      name: null,
      age: null,
      ageRange: null,
      gender: null,
      description: null,
      zone: null,
    };
    const out = buildMatchInput(blank, blank);
    expect(out.missing).toEqual({
      name: "Unidentified",
      age: "unknown",
      gender: "unknown",
      description: "(none given)",
      zone: "unknown",
    });
  });
});

describe("renderMatchPrompt", () => {
  it("includes both parties' descriptions and ages", () => {
    const prompt = renderMatchPrompt(buildMatchInput(missing, found));
    expect(prompt).toContain("Red frock, two braids");
    expect(prompt).toContain("लाल कपड़े, छोटी बच्ची");
    expect(prompt).toContain("7");
    expect(prompt).toContain("~6-8");
  });
});

import { describe, it, expect } from "vitest";
import { textFilterMissing } from "./mapSearchFilter";

const items = [
  { id: "a", label: "Kamala Bai · 70", meta: "Sector 4 · White saree, walking stick" },
  { id: "b", label: "Unidentified · ~7", meta: "Sector 2 · Red t-shirt, blue pants" },
  { id: "c", label: "Arun Mehta · 45", meta: "Sector 9 · Blue checked shirt" },
];

describe("textFilterMissing", () => {
  it("keeps items whose label+meta contain every query token (case-insensitive)", () => {
    expect(textFilterMissing(items, "blue").map((i) => i.id)).toEqual(["b", "c"]);
    expect(textFilterMissing(items, "white saree").map((i) => i.id)).toEqual(["a"]);
  });

  it("requires all tokens to match", () => {
    // "t-shirt" contains the substring "shirt", so both b and c match "blue shirt".
    expect(textFilterMissing(items, "blue shirt").map((i) => i.id)).toEqual(["b", "c"]);
    // "checked" only appears for c, so it discriminates.
    expect(textFilterMissing(items, "blue checked").map((i) => i.id)).toEqual(["c"]);
  });

  it("returns everything for a blank query", () => {
    expect(textFilterMissing(items, "  ").map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("returns nothing when no item matches", () => {
    expect(textFilterMissing(items, "elephant")).toEqual([]);
  });
});

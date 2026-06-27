import { describe, it, expect } from "vitest";
import { normalizeChartSpec, normalizeCharts, MAX_POINTS } from "./chartSpec";

const validBar = {
  type: "bar",
  title: "Open reports by zone",
  xKey: "zone",
  series: [{ key: "count", label: "Reports" }],
  data: [
    { zone: "Sector 2", count: 4 },
    { zone: "Sector 4", count: 2 },
  ],
};

describe("normalizeChartSpec", () => {
  it("accepts a valid bar spec", () => {
    const out = normalizeChartSpec(validBar);
    expect(out).not.toBeNull();
    expect(out!.type).toBe("bar");
    expect(out!.data).toHaveLength(2);
  });

  it("accepts a valid pie spec without xKey/series", () => {
    const out = normalizeChartSpec({
      type: "pie",
      title: "Match methods",
      data: [
        { name: "aadhaar", value: 3 },
        { name: "attribute", value: 7 },
      ],
    });
    expect(out?.type).toBe("pie");
  });

  it("coerces pie data to {name, value} regardless of source field names", () => {
    const out = normalizeChartSpec({
      type: "pie",
      title: "Methods",
      data: [
        { method: "face", count: 6 },
        { method: "aadhaar", count: 3 },
      ],
    });
    expect(out!.data).toEqual([
      { name: "face", value: 6 },
      { name: "aadhaar", value: 3 },
    ]);
  });

  it("rejects an unknown chart type", () => {
    expect(normalizeChartSpec({ ...validBar, type: "scatter" })).toBeNull();
  });

  it("rejects when data is not an array", () => {
    expect(normalizeChartSpec({ ...validBar, data: "nope" })).toBeNull();
  });

  it("rejects a bar spec missing series", () => {
    expect(normalizeChartSpec({ type: "bar", title: "x", xKey: "zone", data: [] })).toBeNull();
  });

  it("caps data to MAX_POINTS", () => {
    const big = { ...validBar, data: Array.from({ length: MAX_POINTS + 20 }, (_, i) => ({ zone: `Z${i}`, count: i })) };
    expect(normalizeChartSpec(big)!.data).toHaveLength(MAX_POINTS);
  });

  it("defaults a missing title", () => {
    const { title, ...noTitle } = validBar;
    void title;
    expect(normalizeChartSpec(noTitle)!.title.length).toBeGreaterThan(0);
  });

  it("returns null for non-object input", () => {
    expect(normalizeChartSpec(null)).toBeNull();
    expect(normalizeChartSpec("x")).toBeNull();
  });
});

describe("normalizeCharts", () => {
  it("keeps only valid specs from an array, dropping invalid ones", () => {
    const out = normalizeCharts([validBar, { type: "scatter" }, null, validBar]);
    expect(out).toHaveLength(2);
    expect(out.every((c) => c.type === "bar")).toBe(true);
  });

  it("returns an empty array for non-array input", () => {
    expect(normalizeCharts("nope")).toEqual([]);
    expect(normalizeCharts(null)).toEqual([]);
  });
});

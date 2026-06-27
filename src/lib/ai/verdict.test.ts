import { describe, it, expect } from "vitest";
import { bucketVerdict, verdictLabel } from "./verdict";

describe("bucketVerdict", () => {
  it("calls high confidence 'likely'", () => {
    expect(bucketVerdict(0.9)).toBe("likely");
    expect(bucketVerdict(0.75)).toBe("likely");
  });

  it("calls mid confidence 'possible'", () => {
    expect(bucketVerdict(0.6)).toBe("possible");
    expect(bucketVerdict(0.45)).toBe("possible");
  });

  it("calls low confidence 'unlikely'", () => {
    expect(bucketVerdict(0.4)).toBe("unlikely");
    expect(bucketVerdict(0)).toBe("unlikely");
  });
});

describe("verdictLabel", () => {
  it("renders human labels", () => {
    expect(verdictLabel("likely")).toBe("Likely");
    expect(verdictLabel("possible")).toBe("Possible");
    expect(verdictLabel("unlikely")).toBe("Unlikely");
  });
});

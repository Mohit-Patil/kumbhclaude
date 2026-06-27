import { describe, it, expect } from "vitest";
import { parsePointPlacemarks, parseChokeMeta } from "./kml";

describe("parsePointPlacemarks", () => {
  it("extracts name and lat/lng (KML order is lng,lat,alt)", () => {
    const kml = `<Placemark><name>Camera A</name><Point><coordinates>73.711,19.983,0</coordinates></Point></Placemark>`;
    expect(parsePointPlacemarks(kml)).toEqual([{ name: "Camera A", lat: 19.983, lng: 73.711 }]);
  });

  it("skips Polygon placemarks, keeping only Points", () => {
    const kml = `
      <Placemark><name>Zone 1</name><Polygon><outerBoundaryIs><LinearRing><coordinates>
        73.71,19.98,0 73.72,19.98,0 73.71,19.98,0
      </coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
      <Placemark><name>Cam 1</name><Point><coordinates>73.711,19.983,0</coordinates></Point></Placemark>`;
    const result = parsePointPlacemarks(kml);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Cam 1");
  });

  it("includes the description when present", () => {
    const kml = `<Placemark><name>Choke</name><description>Category: Parking | Risk: high</description><Point><coordinates>73.8,19.9,0</coordinates></Point></Placemark>`;
    expect(parsePointPlacemarks(kml)[0].description).toBe("Category: Parking | Risk: high");
  });

  it("unescapes XML entities and decodes CDATA in name/description", () => {
    const kml = `<Placemark><name>Dwarka &amp; Chowk</name><Point><coordinates>73.8,19.9,0</coordinates></Point></Placemark>`;
    expect(parsePointPlacemarks(kml)[0].name).toBe("Dwarka & Chowk");
  });

  it("drops points with out-of-range coordinates", () => {
    const kml = `<Placemark><name>Bad</name><Point><coordinates>999,19.9,0</coordinates></Point></Placemark>`;
    expect(parsePointPlacemarks(kml)).toEqual([]);
  });
});

describe("parseChokeMeta", () => {
  it("pulls category and risk out of the pipe-delimited description", () => {
    const meta = parseChokeMeta(
      "Category: Traffic choke point | Status: confirmed | Risk: very high | Note: vital artery",
    );
    expect(meta.category).toBe("Traffic choke point");
    expect(meta.risk).toBe("very high");
    expect(meta.note).toBe("vital artery");
  });

  it("returns empty fields when nothing matches", () => {
    expect(parseChokeMeta("just some text")).toEqual({});
  });
});

/** Chart specification emitted by the analytics agent and rendered with Recharts. */
import { z } from "zod";

export const MAX_POINTS = 50;
const CHART_TYPES = ["bar", "line", "area", "pie"] as const;
export type ChartType = (typeof CHART_TYPES)[number];

export type ChartSeries = { key: string; label: string };
export type ChartSpec = {
  type: ChartType;
  title: string;
  data: Array<Record<string, string | number>>;
  /** Required for bar/line/area; the category/x-axis field. */
  xKey?: string;
  /** Required for bar/line/area; one entry per plotted measure. */
  series?: ChartSeries[];
};

/** Zod schema used as the `show_chart` tool input. */
export const ChartSpecSchema = z.object({
  type: z.enum(CHART_TYPES),
  title: z.string(),
  data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
  xKey: z.string().optional(),
  series: z.array(z.object({ key: z.string(), label: z.string() })).optional(),
});

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Defensively normalize whatever the model produced into a renderable ChartSpec,
 * or null if it can't be salvaged. Caps data length; never throws.
 */
export function normalizeChartSpec(input: unknown): ChartSpec | null {
  if (!isRecord(input)) return null;

  const type = input.type;
  if (typeof type !== "string" || !CHART_TYPES.includes(type as ChartType)) return null;

  if (!Array.isArray(input.data)) return null;
  const data = input.data
    .filter((d): d is Record<string, string | number> => isRecord(d))
    .slice(0, MAX_POINTS);

  const title = typeof input.title === "string" && input.title.trim() ? input.title : "Chart";

  if (type !== "pie") {
    const xKey = input.xKey;
    const series = input.series;
    if (typeof xKey !== "string" || !xKey) return null;
    if (
      !Array.isArray(series) ||
      series.length === 0 ||
      !series.every((s) => isRecord(s) && typeof s.key === "string" && typeof s.label === "string")
    ) {
      return null;
    }
    return { type: type as ChartType, title, data, xKey, series: series as ChartSeries[] };
  }

  // Pie always renders from {name, value}; coerce whatever field names the model used.
  const pieData = data.map((d) => {
    const name =
      typeof d.name === "string"
        ? d.name
        : (Object.values(d).find((v) => typeof v === "string") as string | undefined) ?? "—";
    const value =
      typeof d.value === "number"
        ? d.value
        : (Object.values(d).find((v) => typeof v === "number") as number | undefined) ?? 0;
    return { name, value };
  });
  return { type: "pie", title, data: pieData };
}

/** Normalize an array of specs (e.g. a saved dashboard), dropping any invalid entries. */
export function normalizeCharts(input: unknown): ChartSpec[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((c) => normalizeChartSpec(c))
    .filter((c): c is ChartSpec => c !== null);
}

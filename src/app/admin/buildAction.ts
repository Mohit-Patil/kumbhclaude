"use server";

import { generateText, stepCountIs, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { metricTools } from "@/lib/analytics/metricTools";
import { ChartSpecSchema, normalizeChartSpec, type ChartSpec } from "@/lib/analytics/chartSpec";
import { saveDashboard } from "@/lib/analytics/dashboardStore";

const SYSTEM = `Build a rich, intuitive analytics dashboard for the requested theme for Punarmilan,
a missing-person reunification service at the Nashik Kumbh Mela.

Steps:
1. Call the metric tools to fetch real data across MANY dimensions relevant to the theme.
2. FIRST emit one show_chart with type "stat" — a KPI overview row of 4-6 headline numbers from
   the kpis tool (e.g. reunion rate %, reunited, open missing, open minors, avg minutes to
   reunite). Pass them as data: [{name, value}, ...].
3. THEN emit 5 to 8 more charts via show_chart covering different angles — choose from: status
   counts, trends over time, activity by hour, by zone, by age band, by gender, match methods,
   confidence distribution, reunion funnel, time to reunion, top booths. Prefer variety of chart
   types (bar, line, area, pie). Pass the real data points inline in each chart's data.

Make it comprehensive and multi-dimensional, not basic. Do not write prose — only call tools.`;

export async function buildDashboardAction(
  theme: string,
): Promise<{ id?: string; count?: number; error?: string }> {
  const t = theme.trim();
  if (!t) return { error: "Describe the dashboard you want." };

  const charts: ChartSpec[] = [];
  const show_chart = tool({
    description: "Add a chart to the dashboard; pass the data points inline in `data`.",
    inputSchema: ChartSpecSchema,
    execute: async (spec) => {
      const n = normalizeChartSpec(spec);
      if (n) charts.push(n);
      return { ok: n != null };
    },
  });

  try {
    await generateText({
      model: anthropic("claude-sonnet-4-6"),
      tools: { ...metricTools, show_chart },
      stopWhen: stepCountIs(20),
      system: SYSTEM,
      prompt: `Theme: ${t}`,
    });
    if (charts.length === 0) return { error: "Couldn't generate any charts for that theme." };
    const id = await saveDashboard(t, charts);
    return { id, count: charts.length };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Dashboard build failed." };
  }
}

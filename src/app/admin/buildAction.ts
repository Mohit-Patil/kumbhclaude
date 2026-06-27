"use server";

import { generateText, stepCountIs, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { metricTools } from "@/lib/analytics/metricTools";
import { ChartSpecSchema, normalizeChartSpec, type ChartSpec } from "@/lib/analytics/chartSpec";
import { saveDashboard } from "@/lib/analytics/dashboardStore";

const SYSTEM = `Build a cohesive analytics dashboard for the requested theme for Punarmilan, a
missing-person reunification service at the Nashik Kumbh Mela. Use the metric tools to fetch real
data, then emit 3 to 6 complementary charts via show_chart that cover the theme from different
angles (totals, trends over time, by zone, match methods, time to reunion, busiest booths — as
relevant). Pick sensible chart types and pass the real data points inline. Do not write prose —
only call tools.`;

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
      stopWhen: stepCountIs(12),
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

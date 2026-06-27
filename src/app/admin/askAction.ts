"use server";

import { generateText, stepCountIs, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { metricTools } from "@/lib/analytics/metricTools";
import { ChartSpecSchema, normalizeChartSpec, type ChartSpec } from "@/lib/analytics/chartSpec";

export type AnalyticsAnswer = { answer: string; charts: ChartSpec[]; error?: string };

const SYSTEM = `You are the analytics assistant for Punarmilan, a missing-person reunification
service at the Nashik Kumbh Mela. Administrators ask you about the operation; you answer with
real numbers from the metric tools and visualize them.

Rules:
- ALWAYS call the metric tools to get real data. Never invent numbers.
- After fetching data, call show_chart (one or more times) to visualize it, passing the actual
  data points inline. Pick a sensible chart type: bar for by-zone/by-booth/by-method,
  line or area for over-time, pie for share-of-total.
- Then write a concise 1–3 sentence answer highlighting the key takeaway. Use plain language.
- If a question is outside the available metrics (status counts, reports over time, by zone,
  match methods, time to reunion, top booths), say what you can show instead.
- Keep it factual and operational.`;

export async function askAnalytics(question: string): Promise<AnalyticsAnswer> {
  const charts: ChartSpec[] = [];

  const show_chart = tool({
    description:
      "Render a chart for the administrator. Call after fetching data; pass the data points inline in `data`.",
    inputSchema: ChartSpecSchema,
    execute: async (spec) => {
      const normalized = normalizeChartSpec(spec);
      if (normalized) charts.push(normalized);
      return { ok: normalized != null };
    },
  });

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      tools: { ...metricTools, show_chart },
      stopWhen: stepCountIs(8),
      system: SYSTEM,
      prompt: question,
    });
    return { answer: result.text || "I couldn't find anything for that.", charts };
  } catch (err) {
    return {
      answer: "",
      charts,
      error: err instanceof Error ? err.message : "Analytics request failed.",
    };
  }
}

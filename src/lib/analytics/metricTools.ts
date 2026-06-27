import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

async function rpc(name: string, args?: Record<string, unknown>) {
  const { data, error } = await supabase.rpc(name, args ?? {});
  if (error) throw new Error(`${name} failed: ${error.message}`);
  return data;
}

/** Safe, aggregate-only analytics tools the agent may call. No PII, no audit log. */
export const metricTools = {
  status_counts: tool({
    description:
      "Current totals across the system: open missing reports, open found reports, proposed matches, and reunited people.",
    inputSchema: z.object({}),
    execute: async () => rpc("metric_status_counts"),
  }),
  reports_over_time: tool({
    description:
      "Time series of counts. kind 'missing'/'found' counts reports by when they were filed; 'reunited' counts reunions by when resolved. bucket is 'hour' or 'day'.",
    inputSchema: z.object({
      bucket: z.enum(["hour", "day"]).default("day"),
      kind: z.enum(["missing", "found", "reunited"]).default("missing"),
    }),
    execute: async ({ bucket, kind }) =>
      rpc("metric_reports_over_time", { p_bucket: bucket, p_kind: kind }),
  }),
  by_zone: tool({
    description: "Counts grouped by zone for 'missing' or 'found' reports.",
    inputSchema: z.object({ kind: z.enum(["missing", "found"]).default("missing") }),
    execute: async ({ kind }) => rpc("metric_by_zone", { p_kind: kind }),
  }),
  match_methods: tool({
    description: "Reunions grouped by match method (face, aadhaar, phone, attribute).",
    inputSchema: z.object({}),
    execute: async () => rpc("metric_match_methods"),
  }),
  time_to_reunion: tool({
    description: "Average and median minutes from report to reunion, with the count of reunions.",
    inputSchema: z.object({}),
    execute: async () => rpc("metric_time_to_reunion"),
  }),
  top_booths: tool({
    description: "Busiest booths by total report volume (missing + found).",
    inputSchema: z.object({ limit: z.number().int().min(1).max(50).default(10) }),
    execute: async ({ limit }) => rpc("metric_top_booths", { p_limit: limit }),
  }),
};

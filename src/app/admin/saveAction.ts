"use server";

import { saveDashboard } from "@/lib/analytics/dashboardStore";
import { normalizeCharts, type ChartSpec } from "@/lib/analytics/chartSpec";

export async function saveDashboardAction(
  name: string,
  charts: ChartSpec[],
): Promise<{ id?: string; error?: string }> {
  try {
    const valid = normalizeCharts(charts);
    if (valid.length === 0) return { error: "No valid charts to save." };
    const id = await saveDashboard(name, valid);
    return { id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed." };
  }
}

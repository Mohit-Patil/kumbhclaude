import { supabase } from "@/lib/supabase";
import { normalizeCharts, type ChartSpec } from "./chartSpec";

export type DashboardSummary = { id: string; name: string; chartCount: number; createdAt: string };
export type Dashboard = { id: string; name: string; charts: ChartSpec[] };

type DashboardRow = { id: string; name: string; charts: unknown; created_at: string };

/** Persist a dashboard via the scoped RPC; returns its id. */
export async function saveDashboard(name: string, charts: ChartSpec[]): Promise<string> {
  const { data, error } = await supabase.rpc("save_dashboard", {
    p_name: name,
    p_charts: normalizeCharts(charts),
  });
  if (error) throw new Error(`save_dashboard failed: ${error.message}`);
  return data as string;
}

export async function listDashboards(): Promise<DashboardSummary[]> {
  const { data } = await supabase
    .from("dashboard")
    .select("id,name,charts,created_at")
    .order("created_at", { ascending: false });
  return ((data ?? []) as DashboardRow[]).map((d) => ({
    id: d.id,
    name: d.name,
    chartCount: Array.isArray(d.charts) ? d.charts.length : 0,
    createdAt: d.created_at,
  }));
}

export async function getDashboard(id: string): Promise<Dashboard | null> {
  const { data } = await supabase
    .from("dashboard")
    .select("id,name,charts")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const row = data as DashboardRow;
  return { id: row.id, name: row.name, charts: normalizeCharts(row.charts) };
}

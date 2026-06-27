"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildDashboardAction } from "@/app/admin/buildAction";

const PRESETS: { label: string; theme: string }[] = [
  { label: "Operations overview", theme: "operations overview: KPIs, case status, activity, zones, top booths" },
  { label: "Reunification performance", theme: "reunification performance: reunion rate, funnel, match methods, confidence, time to reunite" },
  { label: "Demographics", theme: "who is going missing: age bands, gender, minors, by zone" },
  { label: "Zone hotspots", theme: "zone hotspots: missing and found by zone, busiest booths, activity by hour" },
];

export function BuildDashboardBar() {
  const [theme, setTheme] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function run(themeStr: string) {
    const t = themeStr.trim();
    if (!t || busy) return;
    setBusy(true);
    setError(null);
    const res = await buildDashboardAction(t);
    setBusy(false);
    if (res.id) router.push(`/admin/dashboards/${res.id}`);
    else setError(res.error ?? "Build failed.");
  }

  return (
    <div className="buildwrap">
      <form
        className="buildbar"
        onSubmit={(e) => {
          e.preventDefault();
          run(theme);
        }}
      >
        <span className="buildbar-label">Auto-build a dashboard</span>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Describe a dashboard, or pick a template below…"
          aria-label="Dashboard theme"
          disabled={busy}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
          {busy ? "Building…" : "Build"}
        </button>
        <Link href="/admin/dashboards" className="buildbar-link">
          Saved dashboards →
        </Link>
        {error && <span className="buildbar-err">{error}</span>}
      </form>
      <div className="buildbar-presets">
        <span className="buildbar-presets-label">Readymade:</span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="buildbar-preset"
            onClick={() => run(p.theme)}
            disabled={busy}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

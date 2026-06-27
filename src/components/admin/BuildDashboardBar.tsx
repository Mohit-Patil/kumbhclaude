"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildDashboardAction } from "@/app/admin/buildAction";

export function BuildDashboardBar() {
  const [theme, setTheme] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function build(e: React.FormEvent) {
    e.preventDefault();
    const t = theme.trim();
    if (!t || busy) return;
    setBusy(true);
    setError(null);
    const res = await buildDashboardAction(t);
    setBusy(false);
    if (res.id) router.push(`/admin/dashboards/${res.id}`);
    else setError(res.error ?? "Build failed.");
  }

  return (
    <form className="buildbar" onSubmit={build}>
      <span className="buildbar-label">Auto-build a dashboard</span>
      <input
        type="text"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        placeholder="e.g. operations overview, reunion performance, zone hotspots…"
        aria-label="Dashboard theme"
      />
      <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
        {busy ? "Building…" : "Build"}
      </button>
      <Link href="/admin/dashboards" className="buildbar-link">
        Saved dashboards →
      </Link>
      {error && <span className="buildbar-err">{error}</span>}
    </form>
  );
}

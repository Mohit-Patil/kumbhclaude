"use client";

import { useState } from "react";
import Link from "next/link";
import { askAnalytics, type AnalyticsAnswer } from "@/app/admin/askAction";
import { saveDashboardAction } from "@/app/admin/saveAction";
import type { ChartSpec } from "@/lib/analytics/chartSpec";
import { ChartRenderer } from "./ChartRenderer";

type Turn =
  | { role: "user"; text: string }
  | { role: "assistant"; pending: true }
  | ({ role: "assistant"; pending: false } & AnalyticsAnswer);

const SUGGESTIONS = [
  "How many open cases right now?",
  "Reunions by match method",
  "Missing reports by zone",
  "Average time to reunite someone",
  "Which booths are busiest?",
];

export function AnalyticsChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pinned, setPinned] = useState<ChartSpec[]>([]);
  const [dashName, setDashName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  function pin(spec: ChartSpec) {
    setSavedId(null);
    setPinned((p) => (p.includes(spec) ? p : [...p, spec]));
  }

  async function saveDashboard() {
    if (pinned.length === 0 || saving) return;
    setSaving(true);
    const res = await saveDashboardAction(dashName || "Dashboard", pinned);
    setSaving(false);
    if (res.id) {
      setSavedId(res.id);
      setPinned([]);
      setDashName("");
    }
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    setTurns((t) => [...t, { role: "user", text: q }, { role: "assistant", pending: true }]);
    const res = await askAnalytics(q);
    setTurns((t) => {
      const copy = t.slice(0, -1);
      copy.push({ role: "assistant", pending: false, ...res });
      return copy;
    });
    setBusy(false);
  }

  return (
    <div className="achat">
      <div className="achat-feed">
        {turns.length === 0 && (
          <div className="achat-empty">
            <h2>Ask about the operation</h2>
            <p>Counts, trends over time, by zone, match methods, time to reunite, busiest booths.</p>
            <div className="achat-chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="achat-chip" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) =>
          turn.role === "user" ? (
            <div key={i} className="achat-msg user">
              {turn.text}
            </div>
          ) : turn.pending ? (
            <div key={i} className="achat-msg bot">
              <span className="achat-typing">Analyzing…</span>
            </div>
          ) : (
            <div key={i} className="achat-msg bot">
              {turn.error ? (
                <p className="achat-err">Couldn&apos;t complete that: {turn.error}</p>
              ) : (
                <>
                  {turn.answer && <p className="achat-answer">{turn.answer}</p>}
                  {turn.charts.map((c, j) => (
                    <ChartRenderer key={j} spec={c} onPin={() => pin(c)} pinned={pinned.includes(c)} />
                  ))}
                </>
              )}
            </div>
          ),
        )}
      </div>

      {savedId && (
        <div className="achat-saved">
          Dashboard saved.{" "}
          <Link href={`/admin/dashboards/${savedId}`}>Open it →</Link>
        </div>
      )}

      {pinned.length > 0 && (
        <div className="achat-tray">
          <span className="achat-tray-count">
            {pinned.length} chart{pinned.length === 1 ? "" : "s"} pinned
          </span>
          <input
            type="text"
            placeholder="Dashboard name…"
            value={dashName}
            onChange={(e) => setDashName(e.target.value)}
            aria-label="Dashboard name"
          />
          <button type="button" className="btn btn-primary btn-sm" onClick={saveDashboard} disabled={saving}>
            {saving ? "Saving…" : "Save dashboard"}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPinned([])}>
            Clear
          </button>
        </div>
      )}

      <form
        className="achat-bar"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          type="text"
          placeholder="Ask about cases, reunions, zones, booths…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Ask the analytics assistant"
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "…" : "Ask"}
        </button>
      </form>
    </div>
  );
}

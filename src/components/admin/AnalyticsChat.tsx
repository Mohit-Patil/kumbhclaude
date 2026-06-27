"use client";

import { useState } from "react";
import { askAnalytics, type AnalyticsAnswer } from "@/app/admin/askAction";
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
                    <ChartRenderer key={j} spec={c} />
                  ))}
                </>
              )}
            </div>
          ),
        )}
      </div>

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

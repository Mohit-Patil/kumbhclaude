# Admin Analytics Chat (B1) — Design

**Date:** 2026-06-27
**Status:** Approved (curated metric tools; Recharts; Claude Sonnet 4.6)
**Branch:** `worktree-ai-analytics-chat`
**Feature:** B1 of two (B2 = saved/auto dashboards, next build)

## Problem

Administrators have no way to ask questions of the reunification data. The dashboard shows live
queues but no analytics — counts over time, by zone, match-method mix, time-to-reunion, busiest
booths. They need a conversational way to "see the metrics."

## Goal

An `/admin` chat where an administrator asks in plain language and gets a short narrative answer
**plus a chart**, grounded only in safe aggregate data (never PII or `audit_log`).

## Approach

A tool-calling agent over a fixed set of safe analytics RPCs. Claude picks the right metric(s),
reads the aggregate rows, emits chart spec(s), and writes the answer. Curated tools (not free SQL)
keep the agent away from PII/audit and make behavior predictable.

## Data layer — safe analytics RPCs

Read-only Postgres functions, `SECURITY DEFINER`, `set search_path=''`, granted to `anon`,
returning aggregate rows only:

- `metric_status_counts()` → open_missing, open_found, proposed, reunited
- `metric_reports_over_time(p_bucket text, p_kind text)` → {bucket, count}; bucket ∈ hour|day,
  kind ∈ missing|found|reunited
- `metric_by_zone(p_kind text)` → {zone, count}; kind ∈ missing|found
- `metric_match_methods()` → {method, count} for reunited matches
- `metric_time_to_reunion()` → {avg_minutes, median_minutes, count}
- `metric_top_booths(p_limit int)` → {booth_code, zone, count}

None select from `audit_log` or expose person identity beyond aggregate counts.

## Agent layer

`src/app/admin/askAction.ts` — `"use server"` `askAnalytics(question)`:
- `generateText` with Claude Sonnet 4.6 (`@ai-sdk/anthropic`), `stopWhen: stepCountIs(8)`.
- Tools: the six metric tools (each calls its RPC and returns JSON) + a `show_chart` tool the
  model calls to emit a `ChartSpec` (collected server-side, not executed).
- Returns `{ answer: string, charts: ChartSpec[] }`.

## ChartSpec + rendering

`src/lib/analytics/chartSpec.ts` — Zod `ChartSpec`:
`{ type: "bar"|"line"|"area"|"pie", title, data: Record<string,string|number>[], xKey, series:
[{key,label}] }` (pie uses data of {name,value}). Pure `normalizeChartSpec` guards the type,
ensures `data`/`series` are arrays, and caps data points (e.g. 50) — **TDD**.

`src/components/admin/ChartRenderer.tsx` (client) maps `type` → Recharts component, themed to the
Punarmilan palette.

## UI

`/admin` page (server shell) + `AnalyticsChat` (client): a transcript of question/answer turns;
each answer renders narrative text + its charts. v1 turns are independent (no multi-turn memory)
but shown as a running transcript. Non-streaming: the action returns the full result; UI shows a
"thinking…" state. A few suggested-question chips seed the empty state.

## Error handling

- RPC/tool failure → the agent surfaces it in the narrative; the turn still renders.
- Malformed chart spec → dropped by `normalizeChartSpec`, never crashes the page.
- Only the six aggregate RPCs are reachable → no PII / audit exposure by construction.

## Testing

- TDD `normalizeChartSpec` (type guard, array coercion, point cap, pie vs xy shapes).
- Verify the RPCs and the live agent (real questions → answer + chart) at runtime.

## Access note

The app has no auth, so `/admin` is an open route for the demo. Flag: protect it (admin auth)
before real production use.

## Non-goals (this build)

- Saved/auto multi-chart dashboards (B2, next).
- Multi-turn conversational memory.
- Free-form text-to-SQL.
- Auth/RBAC.

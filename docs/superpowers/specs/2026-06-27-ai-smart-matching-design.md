# AI Smart Matching + Explanations — Design

**Date:** 2026-06-27
**Status:** Approved (model: Claude Haiku 4.5; trigger: auto on dashboard load)
**Feature:** 1 of 4 in the AI feature set (smart matching, multilingual intake, photo→attributes, PA announcements)
**Branch:** `worktree-ai-smart-matching`

## Problem

Matching runs in-database: triggers on `missing_report` / `found_report` insert call
`generate_candidate_matches()`, which scores every open missing×found pair on age-band
overlap, gender, Aadhaar/phone hits, PostGIS proximity, and a **description score that is
English-only and purely lexical** (trigram + word overlap via `regexp_replace(a,'[^a-z ]')`).

That scorer misses Hindi/Marathi descriptions, synonyms ("red" ≈ "maroon" ≈ "लाल"), and
semantic equivalence ("blue dress" ≈ "navy frock"). The dashboard shows method + a numeric
confidence but **no human-readable reason** for a match.

## Goal

Layer an AI re-rank + explanation on top of the existing candidate generator: better
multilingual/semantic scoring and a one-sentence rationale, surfaced on the control-room
dashboard. Do not replace the SQL generator.

## Approach: retrieve-then-rerank

- **Recall (unchanged):** `generate_candidate_matches()` produces candidate `match` rows
  (methods `aadhaar` / `phone` / `attribute`).
- **Precision + explanation (new):** for each proposed `attribute` match, Claude Haiku 4.5
  reads both people's attributes (name, age, gender, description, zone, time gap) and returns
  `confidence` (0–1), `verdict` (Likely / Possible / Unlikely), and a one-sentence
  `rationale`. Aadhaar/phone hits keep a templated rationale (no LLM call).

## Provider

Vercel AI SDK (`ai` v7) through **AI Gateway**, model string `anthropic/claude-haiku-4-5`,
authenticated by the existing `VERCEL_OIDC_TOKEN` — no separate Anthropic key. Structured
output via `generateObject` with a Zod schema.

## Components (isolated, single-purpose)

- `src/lib/ai/matchScorer.ts` — `buildMatchInput(missing, found)` (pure: assembles the
  comparison payload) + `scoreMatch(input)` (the `generateObject` call). Returns
  `{ confidence, verdict, rationale }`.
- `src/lib/ai/verdict.ts` — pure helpers: bucket a confidence into a verdict; label/format.
- DB migration: `match_explanation(missing_report_id uuid, found_report_id uuid,
  ai_confidence numeric, ai_verdict text, ai_rationale text, model text, created_at
  timestamptz, primary key(missing_report_id, found_report_id))`. **Keyed by the report
  pair** so it survives the trigger that deletes/recreates proposed matches. RLS: public read.
- `src/lib/queries.ts` — `getCandidateMatches()` left-joins `match_explanation`, exposes
  `aiConfidence` / `aiVerdict` / `aiRationale`, and orders by AI confidence (fallback to the
  SQL confidence).
- `src/lib/ai/runMatchScoring.ts` — server-only: given proposed matches, find pairs lacking
  an explanation, score them in parallel (`Promise.allSettled`), upsert into
  `match_explanation`. Bounded N (≈15).
- `src/app/dashboard/page.tsx` — calls the scoring pass before rendering (auto on load);
  match cards show a verdict badge + rationale.

## Data flow

Dashboard load → fetch proposed matches → `runMatchScoring` scores any unscored `attribute`
pairs (cached pairs skipped) → re-fetch/join `match_explanation` → render cards ordered by AI
confidence with verdict + rationale.

## Error handling

- AI call failure / gateway unavailable → the pair is left unscored; the card falls back to
  the SQL method + confidence with no rationale. Dashboard never breaks.
- Scoring is best-effort (`Promise.allSettled`); a slow/failed call doesn't block other pairs.
- Writes upsert on the pair key (idempotent across reloads).

## Testing

- TDD the pure functions: `buildMatchInput` (correct payload from two person records),
  `verdict` bucketing/labels, and the view-model merge in the `getCandidateMatches` mapping.
- The live `generateObject` call and the dashboard rendering are verified at runtime (dev
  server + a real proposed match), not unit-tested.

## Non-goals

- Photo/face matching (separate feature).
- Embeddings / pgvector.
- Re-scoring aadhaar/phone hits with the LLM.
- Real-time per-insert AI scoring (scoring is on dashboard load).

# AI Map Search — Design

**Date:** 2026-06-27
**Status:** Approved (AI semantic search; Claude Haiku 4.5)
**Branch:** `worktree-ai-map-search`
**Feature:** Map search bar (A of two new features; B = admin analytics chatbot)

## Problem

The operator `/map` lists open missing reports but offers no way to *search* them. An operator
who hears "an elderly woman in a white saree with a walking stick near Ramkund" must scan the
whole list. Descriptions arrive in English, Hindi, or Marathi with fuzzy attributes.

## Goal

A free-text search box on `/map` that ranks open missing-person reports against the query
(semantic + multilingual), shows the ranked matches with a relevance score and a one-line
reason, and emphasizes the matching pins on the map.

## Approach

AI semantic ranking. There are only ~6–15 open missing reports, so one Claude call ranks all
candidates against the query — no embeddings/index needed.

## Components

- `src/lib/ai/searchMissing.ts` — pure `buildSearchPrompt(query, candidates)` + Zod result
  schema (`{ results: [{ id, score, reason }] }`), plus `searchMissing(query, candidates)`
  which calls `generateObject` (Claude Haiku 4.5 via `@ai-sdk/anthropic`). Candidate shape:
  `{ id, name, age, gender, description, zone }`.
- `src/lib/ai/rankResults.ts` (or within searchMissing) — pure helper to filter by a score
  threshold and sort descending. TDD.
- `src/app/map/searchAction.ts` — `"use server"` action `searchMissingPersons(query)`:
  fetches open missing (reusing `getMapReports`), maps to candidates, calls `searchMissing`,
  returns ranked `[{ id, score, reason }]`.
- `src/components/map/OperatorMap.tsx` — adds search state: a search box at the top of the
  rail; on submit calls the action, then the rail shows ranked results (score% + reason)
  sorted desc and the map emphasizes matched missing pins. "Clear" resets.
- `src/components/map/ReportLayer.tsx` — accepts an optional `highlightIds` set to emphasize
  matched missing pins (larger / ringed); non-matches dim slightly when a search is active.

## Data flow

Operator types query → submit → `searchMissingPersons(query)` (server) → Claude ranks all
open missing candidates → returns ranked ids+scores+reasons → client filters the rail to
results (sorted), highlights pins; selecting a result reuses the existing search-ring + pan.

## Error handling

If the Claude call fails, the client **falls back to a plain text filter** (name/description
substring match over the already-loaded missing reports) so search still works. The map and
rail never break.

## Testing

- TDD pure functions: `buildSearchPrompt` (includes query + every candidate's
  description/age), the result schema, and the threshold/sort ranking helper.
- The live `generateObject` call, the server action, and the map highlighting are verified at
  runtime (dev server + a real query), not unit-tested.

## Non-goals

- Searching found reports (this searches missing only).
- Embeddings / a vector index (candidate set is tiny).
- Persisting searches.

# Punarmilan — पुनर्मिलन ("reunion")

A missing-person **reunification platform** for the Nashik Kumbh Mela. Punarmilan is the
control-room software that ingests **missing-person** and **found-person** reports from help
booths (Kendras), uses Claude to automatically propose which missing report and found report
describe the *same person*, and gives operators the geographic context to act.

> **The core bet:** the hard part isn't storing reports — it's **fusing two reports written by
> different people, in different languages, about the same human being**. That fusion is done by
> an LLM reasoning over the full record, not by string matching.

- **Status:** Hackathon prototype (Kumbathon)
- **Live demo:** [kumbhclaude.vercel.app](https://kumbhclaude.vercel.app)
- **Repo:** `kumbhclaude`

---

## Quick start

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev                        # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public (RLS-enforced) Supabase key — used for reads. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — server-only writes. **Never exposed to the browser.** |
| `ANTHROPIC_API_KEY` | Claude access via the Anthropic provider (matching, search, analytics). |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JS API key for `/map`. |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Google Maps Map ID (for marker clustering / styling). |

> The Supabase schema, RPCs, and triggers (see §2 and §3) are applied to the project **outside
> this repo**. A live Supabase project provisioned with those objects is required.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | ESLint. |
| `npm run test` | Vitest unit tests (pure prompt / geo / chart logic). |
| `npm run geojson` | Regenerate `src/data/*.json` from the KML files in `kmp/`. |

### User surfaces

| Route | User | Purpose |
|-------|------|---------|
| `/report-missing` | Booth volunteer | File a missing-person report (name, age, clothing, photo, last-seen location/pin). |
| `/report-found` | Booth volunteer | File a found-person report. |
| `/register` | Pilgrim/family | Pre-register family members. |
| `/dashboard` | Control-room operator | Live queues of open missing/found reports + **AI candidate matches** to confirm. |
| `/map` | Operator | Map of all active reports + **AI free-text search** + geo-aware search plan (CCTV, police, chokepoints). |
| `/admin` | Administrator | **Conversational analytics** + **AI-generated dashboards** over operational metrics. |

---

## 1. Overview

The Kumbh Mela draws tens of millions of pilgrims into a dense, multilingual crowd where
people — especially children and the elderly — get separated from their families constantly.
Punarmilan ingests reports from help booths, automatically proposes which missing and found
reports describe the *same person*, and gives operators the geographic context to act.

---

## 2. Architecture

### 2.1 Stack

- **Framework:** Next.js 16 (App Router, React 19, React Server Components + Server Actions). TypeScript.
- **Styling:** Tailwind CSS v4.
- **Database:** Supabase (PostgreSQL + PostGIS) in `ap-south-1`.
- **AI:** Vercel AI SDK (`ai` v7) with the Anthropic provider (`@ai-sdk/anthropic`). Models: **Claude Haiku 4.5** (matching, search) and **Claude Sonnet 4.6** (analytics agent).
- **Maps:** Google Maps via `@vis.gl/react-google-maps` + marker clustering.
- **Charts:** Recharts.
- **Validation:** Zod (also the structured-output contract for the LLM).
- **Tests:** Vitest (unit tests on the pure prompt/geo/chart logic).

### 2.2 Layered structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  Client (React Server + Client Components)                            │
│  /dashboard  /map  /admin  /report-missing  /report-found  /register  │
└───────────────┬───────────────────────────────────┬──────────────────┘
                │ Server Actions / RSC fetch          │ Client islands
                ▼                                     ▼  (maps, forms, chat)
┌─────────────────────────────────────────────────────────────────────┐
│  Server layer (Next.js, "use server" / "server-only")                 │
│                                                                       │
│   src/lib/queries.ts ........ dashboard view-model assembly           │
│   src/lib/ai/ ............... match scoring, map search (Claude)      │
│   src/lib/analytics/ ........ metric tools, chart specs, dashboards   │
│   src/lib/searchPlan.ts ..... geo search-plan composition (pure)      │
│   src/lib/geo.ts ............ haversine / nearest-k / proximity (pure)│
│   src/app/**/actions.ts ..... report intake, search, ask, build      │
└───────────┬───────────────────────────────────┬──────────────────────┘
            │ supabase-js (publishable / RLS)     │ Anthropic API
            │ supabase-admin (service role)       │ (via AI SDK)
            ▼                                     ▼
┌──────────────────────────┐          ┌──────────────────────────┐
│  Supabase Postgres        │          │  Claude (Haiku 4.5 /      │
│  + PostGIS                 │          │  Sonnet 4.6)              │
│                            │          └──────────────────────────┘
│  person, booth,            │
│  missing_report,           │   ┌─────────────────────────────────────┐
│  found_report, match,      │   │  Static geo data (committed JSON)    │
│  match_explanation,        │   │  src/data/cctv.json, police.json,    │
│  dashboard, audit_log      │   │  chokepoints.json (derived from KML) │
│                            │   └─────────────────────────────────────┘
│  RPCs: generate_candidate_ │
│  matches(), metric_*(),    │
│  upsert_match_explanation, │
│  save_dashboard            │
└──────────────────────────┘
```

### 2.3 Two Supabase clients (security boundary)

- **`src/lib/supabase.ts`** — public client using the **publishable key**. Read-only by Row-Level
  Security; restricted to public-read tables (`audit_log` stays private). Used for all reads.
- **`src/lib/supabase-admin.ts`** — **service-role** client that bypasses RLS, used **only** in
  server actions for writes (e.g. filing a report). Never shipped to the browser.

### 2.4 Data model (core tables)

- **`person`** — subject identity: `full_name`, `age`, `age_range`, `gender`, `description`, links to `photo`.
- **`booth`** — help booth/Kendra: `code`, `name`, `zone`, PostGIS `location` (geography), `contact_phone`. ~100 booths seeded across 7 zones around the Ramkund/Panchavati core.
- **`missing_report` / `found_report`** — a report about a `person` filed at a `booth`, with `status` (`open` → `matched` → `reunited`) and a PostGIS `report_location`.
- **`match`** — a proposed or confirmed pairing of one missing + one found report, with `match_method` (`aadhaar` / `phone` / `attribute` / `face`), numeric `confidence`, and `status` (`proposed` → `reunited`).
- **`match_explanation`** — AI verdict for a report pair (see §3). Keyed by `(missing_report_id, found_report_id)` so it survives match-row regeneration.
- **`dashboard`** — saved AI-generated analytics dashboards (array of chart specs).

---

## 3. The matching algorithm (how missing folks are matched)

Matching is a **two-stage retrieve-then-rerank pipeline**. Stage 1 runs in the database for
recall; stage 2 uses Claude for precision and human-readable explanations. The design rule is:
*the SQL generator is never replaced — the LLM is layered on top of it.*

```
 New missing/found report inserted
            │
            ▼
 ┌───────────────────────────────────────────────────────────┐
 │ STAGE 1 — RECALL  (Postgres trigger → generate_candidate_   │
 │ matches())                                                  │
 │                                                             │
 │ Scores every open missing × found pair on:                 │
 │   • age-band overlap                                        │
 │   • gender agreement                                        │
 │   • Aadhaar number hit          → method = "aadhaar"        │
 │   • guardian phone hit          → method = "phone"          │
 │   • PostGIS proximity (booth/report location)              │
 │   • description score (English-only, lexical: trigram +     │
 │     word overlap)               → method = "attribute"      │
 │                                                             │
 │ Emits candidate `match` rows (status = "proposed").         │
 └───────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
 ┌───────────────────────────────────────────────────────────┐
 │ STAGE 2 — PRECISION + EXPLANATION  (on dashboard load)      │
 │ src/lib/ai/runMatchScoring.ts → scoreMatch.ts (Claude       │
 │ Haiku 4.5, generateObject)                                  │
 │                                                             │
 │  • aadhaar / phone matches → templated rationale, NO LLM    │
 │    ("Verified Aadhaar number match.")                       │
 │  • attribute matches without an explanation yet → Claude    │
 │    reads BOTH people (name, age, gender, zone, description) │
 │    and returns { confidence 0–1, verdict, rationale }       │
 │    - cross-lingual: English / Hindi / Marathi treated as    │
 │      equivalent; synonyms (red ≈ maroon ≈ लाल) match        │
 │    - conservative system prompt: disagreeing gender or a    │
 │      large age gap sharply lowers confidence                │
 │  • verdict bucket: ≥0.75 likely · ≥0.45 possible · else     │
 │    unlikely  (src/lib/ai/verdict.ts)                        │
 │  • scored in parallel (Promise.allSettled), upserted into   │
 │    match_explanation via RPC (idempotent on the pair key)   │
 └───────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
 ┌───────────────────────────────────────────────────────────┐
 │ RENDER  (src/lib/queries.ts → getCandidateMatches)          │
 │  • join match_explanation onto proposed matches            │
 │  • RE-RANK cards by AI confidence (fallback: SQL confidence)│
 │  • show verdict badge + one-sentence rationale on the card  │
 │  • operator confirms the reunion with one tap               │
 └───────────────────────────────────────────────────────────┘
```

### Why this design

- **Recall vs. precision split.** SQL is cheap and exhaustive — it cheaply narrows millions of
  possible pairs to a bounded candidate set (~15). The LLM is expensive and smart — it only
  judges the candidates that survive. This keeps LLM cost bounded and predictable.
- **The LLM fixes what SQL can't.** The SQL description score is English-only and purely lexical
  (trigram + word overlap). It misses Hindi/Marathi descriptions, synonyms, and semantic
  equivalence ("blue dress" ≈ "navy frock"). Claude reasons over these natively — no separate
  translation pipeline.
- **Hard identifiers skip the LLM.** Aadhaar / phone matches are deterministic ground truth; they
  get a templated rationale and `likely` verdict with no model call (cost + correctness).
- **Idempotent + crash-safe.** `match_explanation` is keyed by the **report pair**, not the match
  row, so it survives the trigger that deletes/recreates proposed matches. Cached pairs are
  skipped on reload.
- **Best-effort, never blocks.** Scoring uses `Promise.allSettled`; a failed/slow Claude call
  leaves that pair unscored and the card falls back to the SQL method + confidence. The dashboard
  never breaks on AI failure.

### Geospatial helpers (`src/lib/geo.ts`)

Pure functions backing both matching proximity hints and the map search plan:
`haversineMeters` (great-circle distance), `nearestK`, `withinRadius`, and `proximityPairs`
(every missing/found pin within a threshold, sorted by distance).

---

## 4. How AI is leveraged in this repo

Claude is used in **four distinct places**, each with a different model/pattern. A consistent
principle runs through all of them: **pure prompt-building is isolated from the SDK call so it can
be unit-tested without a network**, and **all model output is constrained by a Zod schema**.

### 4.1 Smart match scoring & explanation — `src/lib/ai/`
- **Model:** `claude-haiku-4-5` · **Pattern:** `generateObject` with `MatchVerdictSchema`.
- Re-ranks SQL candidate matches and attaches a one-sentence rationale (see §3).
- Files: `matchPrompt.ts` (pure prompt + schema, tested in `matchPrompt.test.ts`),
  `scoreMatch.ts` (the SDK call + conservative "reunification officer" system prompt),
  `runMatchScoring.ts` (orchestration + persistence), `verdict.ts` (confidence→verdict buckets).

### 4.2 Natural-language map search — `src/app/map/searchAction.ts` + `src/lib/ai/searchMissing.ts`
- **Model:** `claude-haiku-4-5` · **Pattern:** `generateObject` with `SearchResultSchema`.
- An operator types free text ("old man, white kurta, lost near Ramkund"). All open missing
  reports are passed as candidates; Claude scores each 0–1 with a reason, cross-lingual and
  synonym-aware. Results are validated (only real candidate IDs kept), filtered by a 0.3
  threshold, and sorted strongest-first (`rankResults`).
- Prompt/ranking logic is pure (`searchPrompt.ts`, tested in `searchPrompt.test.ts`).

### 4.3 Conversational analytics ("ask") — `src/app/admin/askAction.ts`
- **Model:** `claude-sonnet-4-6` · **Pattern:** **agentic tool-use loop** (`generateText` with
  `tools`, `stopWhen: stepCountIs(8)`).
- The admin asks a question in plain language. Claude is given a toolbox of **aggregate-only,
  PII-free metric tools** (`src/lib/analytics/metricTools.ts`) — each is a Supabase RPC wrapper
  (`status_counts`, `reports_over_time`, `by_zone`, `match_methods`, `time_to_reunion`,
  `top_booths`, `kpis`, `by_age_band`, `by_gender`, `reunion_funnel`, `activity_by_hour`,
  `confidence_distribution`). The system prompt forces it to **fetch real numbers (never invent)**,
  then call a `show_chart` tool to visualize, then write a 1–3 sentence takeaway.

### 4.4 AI dashboard builder — `src/app/admin/buildAction.ts`
- **Model:** `claude-sonnet-4-6` · **Pattern:** agentic tool-use loop (`stepCountIs(20)`).
- Given a theme, Claude fetches metrics across many dimensions and emits 6–9 charts (a KPI stat
  row + a variety of bar/line/area/pie charts), which are saved as a reusable dashboard via the
  `save_dashboard` RPC and rendered with Recharts.

### Cross-cutting AI safety & robustness patterns
- **Structured output everywhere.** Every model response is shaped by a Zod schema
  (`MatchVerdictSchema`, `SearchResultSchema`, `ChartSpecSchema`), so the app handles typed data,
  not free text. The SDK retries on schema mismatch.
- **Defensive normalization.** `normalizeChartSpec` salvages or drops whatever the model produced;
  it caps data points (`MAX_POINTS = 50`) and never throws.
- **Grounding / anti-hallucination.** Search results are filtered to valid candidate IDs; the
  analytics agent is restricted to aggregate RPCs and instructed never to invent numbers.
- **Cost discipline.** Cheap model (Haiku) for high-volume per-pair scoring; capable model
  (Sonnet) only for the low-volume analytics agent. Hard identifiers (Aadhaar/phone) and cached
  pairs skip the model entirely.
- **PII boundary.** The analytics tools expose only aggregates — no names, no audit log.

---

## 5. Geo-aware response routing (`/map`)

When an operator selects a missing person's last-seen location, `buildSearchPlan`
(`src/lib/searchPlan.ts`) composes the geo helpers against committed infrastructure data
(`src/data/cctv.json`, `police.json`, `chokepoints.json`, originally derived from the KML files in
`kmp/` via `scripts/generate-geojson.ts`) to produce an actionable plan:

- the **N nearest CCTV cameras** to pull,
- the **single nearest police station** to coordinate with,
- the **chokepoints within the search radius** (where a drifting person is likely to pass).

This reuses infrastructure the authorities already own — a deliberate "no new procurement"
argument from `docs/features.md`.

---

## 6. Report intake flow (`/report-missing`)

`fileMissingReport` (server action, `src/app/report-missing/actions.ts`) uses `useActionState`
and returns a result object (rather than redirecting) so the form can show an inline confirmation.
It: creates the `person`, attaches an optional photo (stored as a `data:` URL in
`photo.storage_ref`), resolves the booth, and inserts the `missing_report` with a PostGIS
`POINT(lon lat)` written as EWKT (`SRID=4326;POINT(...)`). The insert triggers Stage 1 candidate
generation (§3).

---

## 7. Notable design decisions & trade-offs

| Decision | Rationale |
|----------|-----------|
| LLM reranks, never replaces, the SQL matcher | Bounded cost + recall guarantee; AI failure degrades gracefully to SQL scoring. |
| Match explanation keyed by report pair | Survives trigger-driven regeneration of `match` rows; idempotent across reloads. |
| Pure prompt builders separated from SDK calls | Unit-testable prompts/ranking with no network (`*.test.ts`). |
| Two Supabase clients (publishable vs. service-role) | RLS-enforced reads; writes isolated to server actions; service key never reaches the browser. |
| Aggregate-only metric tools for the analytics agent | Prevents the conversational agent from leaking PII. |
| Haiku for matching/search, Sonnet for analytics | Match the model tier to volume and reasoning depth. |

### Known gaps / non-goals (current state)
- Booth on report intake is hardcoded to `K-14` (TODO: resolve from the dropped pin).
- Match scoring runs **on dashboard load**, not per-insert in real time (intentional non-goal).
- No face/photo matching, no embeddings/pgvector — matching is attribute reasoning only.
- Provider auth: the matching design spec references the Vercel AI Gateway + `VERCEL_OIDC_TOKEN`,
  while `scoreMatch.ts` currently calls the Anthropic API directly via `ANTHROPIC_API_KEY`.
  Reconcile before production.

---

## 8. File map (key modules)

```
src/
  app/
    dashboard/page.tsx ............ control-room: queues + AI match cards (force-dynamic)
    map/page.tsx, searchAction.ts . operator map + AI free-text search
    admin/askAction.ts ............ conversational analytics agent (Sonnet, tools)
    admin/buildAction.ts .......... AI dashboard builder (Sonnet, tools)
    report-missing/actions.ts ..... file a missing report (service-role write + PostGIS)
  lib/
    queries.ts .................... dashboard view-models; triggers match scoring + re-rank
    ai/matchPrompt.ts ............. pure match prompt + Zod verdict schema   (tested)
    ai/scoreMatch.ts .............. Claude Haiku match call (generateObject)
    ai/runMatchScoring.ts ......... parallel scoring + upsert to match_explanation
    ai/searchMissing.ts, searchPrompt.ts . AI map search                    (tested)
    ai/verdict.ts ................. confidence→verdict bucketing             (tested)
    analytics/metricTools.ts ...... aggregate-only RPC tools for the agent
    analytics/chartSpec.ts ........ Zod chart schema + defensive normalize   (tested)
    analytics/dashboardStore.ts ... save/list/get AI dashboards
    geo.ts ........................ haversine / nearestK / proximity         (tested)
    searchPlan.ts ................. geo search-plan composition              (tested)
    supabase.ts / supabase-admin.ts public (RLS) vs service-role clients
  data/ ........................... committed CCTV / police / chokepoint geo data
docs/
  features.md ................... product feature thesis
  superpowers/specs/ ............ per-feature design specs (matching, search, analytics, map)
```

---

## Deploy

Deployed on [Vercel](https://vercel.com). Set the environment variables above in the Vercel
project settings, point it at a Supabase project provisioned with the schema/RPCs from §2–§3, and
push to deploy.

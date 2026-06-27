import { supabase } from "./supabase";
import { runMatchScoring } from "./ai/runMatchScoring";
import type { ScorePartyInput } from "./ai/matchPrompt";

/* ---------- view models the UI renders ---------- */
export type Stats = {
  openMissing: number;
  openFound: number;
  candidates: number;
  reunitedToday: number;
};
export type QueueItem = {
  id: string;
  name: string;
  meta: string;
  ago: string;
  photo: string | null;
};
export type MatchCard = {
  id: string;
  confidence: number;
  method: string;
  missingName: string;
  missingMeta: string;
  missingPhoto: string | null;
  foundName: string;
  foundMeta: string;
  foundPhoto: string | null;
  aiConfidence: number | null;
  aiVerdict: string | null;
  aiRationale: string | null;
};
export type ReunitedItem = {
  id: string;
  name: string;
  via: string;
  ago: string;
};
export type MapReport = {
  id: string;
  kind: "missing" | "found";
  lat: number;
  lng: number;
  label: string;
  meta: string;
  boothCode: string | null;
  zone: string | null;
  ago: string;
  photo: string | null;
};

/* ---------- raw embedded row shapes ---------- */
type PersonLite = {
  full_name: string | null;
  age: number | null;
  age_range: string | null;
  description: string | null;
  photo: { storage_ref: string }[] | null;
};
type BoothLite = { code: string | null; zone: string | null };
type BoothGeo = {
  code: string | null;
  zone: string | null;
  lat: number | null;
  lng: number | null;
};
type MissingRow = {
  missing_report_id: string;
  last_seen_to: string | null;
  created_at: string;
  booth: BoothLite | null;
  subject: PersonLite | null;
};
type FoundRow = {
  found_report_id: string;
  found_at: string | null;
  created_at: string;
  booth: BoothLite | null;
  subject: PersonLite | null;
};
type MatchRow = {
  match_id: string;
  confidence: number | null;
  match_method: string;
  resolved_at: string | null;
  missing: { booth: BoothLite | null; subject: PersonLite | null } | null;
  found: { booth: BoothLite | null; subject: PersonLite | null } | null;
};

const PERSON_FIELDS = "full_name,age,age_range,description,photo(storage_ref)";

/* ---------- helpers ---------- */
function timeAgo(ts: string | null): string {
  if (!ts) return "";
  const mins = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function ageLabel(p: PersonLite | null | undefined): string {
  if (!p) return "";
  if (p.age != null) return `${p.age}`;
  if (p.age_range) return p.age_range;
  return "";
}

/** "Aarti Yadav · 7" for known people, "Unidentified · ~7" for the rest. */
function personLabel(p: PersonLite | null | undefined): string {
  if (!p) return "Unknown";
  if (p.full_name) {
    const a = ageLabel(p);
    return a ? `${p.full_name} · ${a}` : p.full_name;
  }
  return p.age_range ? `Unidentified · ${p.age_range}` : "Unidentified";
}

function photoUrl(p: PersonLite | null | undefined): string | null {
  return p?.photo?.[0]?.storage_ref ?? null;
}

function displayName(p: PersonLite | null | undefined): string {
  if (!p) return "Unknown";
  if (p.full_name) return p.full_name;
  if (p.age_range) return `Unidentified · ${p.age_range}`;
  return "Unidentified";
}

async function statusCount(
  table: "missing_report" | "found_report" | "match",
  status: string,
): Promise<number> {
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("status", status);
  return count ?? 0;
}

/* ---------- queries ---------- */
export async function getStats(): Promise<Stats> {
  const [openMissing, openFound, candidates, reunitedToday] = await Promise.all([
    statusCount("missing_report", "open"),
    statusCount("found_report", "open"),
    statusCount("match", "proposed"),
    statusCount("missing_report", "reunited"),
  ]);
  return { openMissing, openFound, candidates, reunitedToday };
}

/**
 * Active reports still being searched for. Includes both `open` and `matched`:
 * a `matched` report only has a *proposed* candidate (not a confirmed reunion),
 * so the person is still missing. Only `reunited` reports drop off. Shared by
 * the dashboard missing queue and the map.
 */
const ACTIVE_STATUSES = ["open", "matched"];

export async function getMissingQueue(): Promise<QueueItem[]> {
  const { data } = await supabase
    .from("missing_report")
    .select(
      `missing_report_id,last_seen_to,created_at,booth:booth!missing_report_booth_id_fkey(code,zone),subject:person!missing_report_subject_person_id_fkey(${PERSON_FIELDS})`,
    )
    .in("status", ACTIVE_STATUSES)
    .order("last_seen_to", { ascending: false });
  const rows = (data ?? []) as unknown as MissingRow[];
  return rows.map((r) => ({
    id: r.missing_report_id,
    name: personLabel(r.subject),
    meta: [r.booth?.zone, r.subject?.description].filter(Boolean).join(" · "),
    ago: timeAgo(r.last_seen_to ?? r.created_at),
    photo: photoUrl(r.subject),
  }));
}

export async function getFoundQueue(): Promise<QueueItem[]> {
  const { data } = await supabase
    .from("found_report")
    .select(
      `found_report_id,found_at,created_at,booth:booth!found_report_booth_id_fkey(code,zone),subject:person!found_report_subject_person_id_fkey(${PERSON_FIELDS})`,
    )
    .eq("status", "open")
    .order("found_at", { ascending: false });
  const rows = (data ?? []) as unknown as FoundRow[];
  return rows.map((r) => ({
    id: r.found_report_id,
    name: displayName(r.subject),
    meta: [r.booth?.code ? `Booth ${r.booth.code}` : null, r.subject?.description]
      .filter(Boolean)
      .join(" · "),
    ago: timeAgo(r.found_at ?? r.created_at),
    photo: photoUrl(r.subject),
  }));
}

type MatchScorePerson = PersonLite & { gender: string | null };
type MatchScoreSide = {
  booth: BoothLite | null;
  subject: MatchScorePerson | null;
} | null;
type MatchScoreRow = {
  match_id: string;
  confidence: number | null;
  match_method: string;
  missing_report_id: string;
  found_report_id: string;
  missing: MatchScoreSide;
  found: MatchScoreSide;
};
type Explanation = {
  ai_confidence: number | null;
  ai_verdict: string | null;
  ai_rationale: string | null;
};

const pairKey = (missingId: string, foundId: string) => `${missingId}:${foundId}`;

async function fetchExplanations(): Promise<Map<string, Explanation>> {
  const { data } = await supabase
    .from("match_explanation")
    .select("missing_report_id,found_report_id,ai_confidence,ai_verdict,ai_rationale");
  const rows = (data ?? []) as Array<Explanation & { missing_report_id: string; found_report_id: string }>;
  return new Map(rows.map((e) => [pairKey(e.missing_report_id, e.found_report_id), e]));
}

function toScoreParty(side: MatchScoreSide): ScorePartyInput {
  return {
    name: side?.subject?.full_name ?? null,
    age: side?.subject?.age ?? null,
    ageRange: side?.subject?.age_range ?? null,
    gender: side?.subject?.gender ?? null,
    description: side?.subject?.description ?? null,
    zone: side?.booth?.zone ?? null,
  };
}

/** Deterministic rationale for hard (Aadhaar/phone) matches — no LLM call. */
function templatedExplanation(method: string, confidence: number): Explanation | null {
  if (method === "aadhaar")
    return { ai_confidence: confidence, ai_verdict: "likely", ai_rationale: "Verified Aadhaar number match." };
  if (method === "phone")
    return { ai_confidence: confidence, ai_verdict: "likely", ai_rationale: "Guardian phone number match." };
  return null;
}

export async function getCandidateMatches(): Promise<MatchCard[]> {
  const { data } = await supabase
    .from("match")
    .select(
      `match_id,confidence,match_method,missing_report_id,found_report_id,missing:missing_report!match_missing_report_id_fkey(booth:booth!missing_report_booth_id_fkey(code,zone),subject:person!missing_report_subject_person_id_fkey(${PERSON_FIELDS},gender)),found:found_report!match_found_report_id_fkey(booth:booth!found_report_booth_id_fkey(code,zone),subject:person!found_report_subject_person_id_fkey(${PERSON_FIELDS},gender))`,
    )
    .eq("status", "proposed")
    .order("confidence", { ascending: false });
  const rows = (data ?? []) as unknown as MatchScoreRow[];

  // Score any attribute matches that don't yet have an AI explanation, then merge.
  const explanations = await fetchExplanations();
  const toScore = rows
    .filter((r) => r.match_method === "attribute" && !explanations.has(pairKey(r.missing_report_id, r.found_report_id)))
    .map((r) => ({
      missingReportId: r.missing_report_id,
      foundReportId: r.found_report_id,
      missing: toScoreParty(r.missing),
      found: toScoreParty(r.found),
    }));
  if (toScore.length > 0) {
    const scored = await runMatchScoring(toScore);
    for (const s of scored) {
      explanations.set(pairKey(s.missingReportId, s.foundReportId), {
        ai_confidence: s.ai_confidence,
        ai_verdict: s.ai_verdict,
        ai_rationale: s.ai_rationale,
      });
    }
  }

  const cards = rows.map((r): MatchCard => {
    const confidence = r.confidence ?? 0;
    const ai =
      templatedExplanation(r.match_method, confidence) ??
      explanations.get(pairKey(r.missing_report_id, r.found_report_id)) ??
      null;
    return {
      id: r.match_id,
      confidence,
      method: r.match_method,
      missingName: personLabel(r.missing?.subject),
      missingMeta: r.missing?.booth?.code ? `Reported at ${r.missing.booth.code}` : "Missing",
      missingPhoto: photoUrl(r.missing?.subject),
      foundName: displayName(r.found?.subject),
      foundMeta: r.found?.booth?.code ? `Safe at ${r.found.booth.code}` : "Found",
      foundPhoto: photoUrl(r.found?.subject),
      aiConfidence: ai?.ai_confidence ?? null,
      aiVerdict: ai?.ai_verdict ?? null,
      aiRationale: ai?.ai_rationale ?? null,
    };
  });

  // Re-rank by AI confidence when present, falling back to the SQL confidence.
  return cards.sort((a, b) => (b.aiConfidence ?? b.confidence) - (a.aiConfidence ?? a.confidence));
}

export async function getReunited(): Promise<ReunitedItem[]> {
  const { data } = await supabase
    .from("match")
    .select(
      "match_id,match_method,resolved_at,missing:missing_report!match_missing_report_id_fkey(booth:booth!missing_report_booth_id_fkey(code),subject:person!missing_report_subject_person_id_fkey(full_name,age,age_range,description))",
    )
    .eq("status", "reunited")
    .order("resolved_at", { ascending: false });
  const rows = (data ?? []) as unknown as MatchRow[];
  return rows.map((r) => ({
    id: r.match_id,
    name: personLabel(r.missing?.subject),
    via: `${r.match_method === "aadhaar" ? "Aadhaar" : r.match_method === "phone" ? "Phone" : "Description"} match${r.missing?.booth?.code ? ` · Booth ${r.missing.booth.code}` : ""}`,
    ago: timeAgo(r.resolved_at),
  }));
}

type MapMissingRow = {
  missing_report_id: string;
  last_seen_to: string | null;
  created_at: string;
  booth: BoothGeo | null;
  subject: PersonLite | null;
};
type MapFoundRow = {
  found_report_id: string;
  found_at: string | null;
  created_at: string;
  booth: BoothGeo | null;
  subject: PersonLite | null;
};

export async function getMapReports(): Promise<{ missing: MapReport[]; found: MapReport[] }> {
  const [missingRes, foundRes] = await Promise.all([
    supabase
      .from("missing_report")
      .select(
        "missing_report_id,last_seen_to,created_at,booth:booth!missing_report_booth_id_fkey(code,zone,lat,lng),subject:person!missing_report_subject_person_id_fkey(full_name,age,age_range,description,photo(storage_ref))",
      )
      .in("status", ACTIVE_STATUSES),
    supabase
      .from("found_report")
      .select(
        "found_report_id,found_at,created_at,booth:booth!found_report_booth_id_fkey(code,zone,lat,lng),subject:person!found_report_subject_person_id_fkey(full_name,age,age_range,description,photo(storage_ref))",
      )
      .in("status", ACTIVE_STATUSES),
  ]);

  const missing = ((missingRes.data ?? []) as unknown as MapMissingRow[])
    .filter((r) => r.booth?.lat != null && r.booth?.lng != null)
    .map(
      (r): MapReport => ({
        id: r.missing_report_id,
        kind: "missing",
        lat: r.booth!.lat!,
        lng: r.booth!.lng!,
        label: personLabel(r.subject),
        meta: [r.booth?.zone, r.subject?.description].filter(Boolean).join(" · "),
        boothCode: r.booth?.code ?? null,
        zone: r.booth?.zone ?? null,
        ago: timeAgo(r.last_seen_to ?? r.created_at),
        photo: photoUrl(r.subject),
      }),
    );

  const found = ((foundRes.data ?? []) as unknown as MapFoundRow[])
    .filter((r) => r.booth?.lat != null && r.booth?.lng != null)
    .map(
      (r): MapReport => ({
        id: r.found_report_id,
        kind: "found",
        lat: r.booth!.lat!,
        lng: r.booth!.lng!,
        label: displayName(r.subject),
        meta: [r.booth?.code ? `Booth ${r.booth.code}` : null, r.subject?.description]
          .filter(Boolean)
          .join(" · "),
        boothCode: r.booth?.code ?? null,
        zone: r.booth?.zone ?? null,
        ago: timeAgo(r.found_at ?? r.created_at),
        photo: photoUrl(r.subject),
      }),
    );

  return { missing, found };
}

export type BoothPin = {
  id: string;
  code: string | null;
  name: string;
  zone: string | null;
  lat: number;
  lng: number;
  phone: string | null;
};

type BoothRow = {
  booth_id: string;
  code: string | null;
  name: string | null;
  zone: string | null;
  lat: number | null;
  lng: number | null;
  contact_phone: string | null;
};

/** All help booths with a plottable location, for the operator map. */
export async function getBooths(): Promise<BoothPin[]> {
  const { data } = await supabase
    .from("booth")
    .select("booth_id,code,name,zone,lat,lng,contact_phone")
    .order("code");

  return ((data ?? []) as unknown as BoothRow[])
    .filter((b) => b.lat != null && b.lng != null)
    .map((b) => ({
      id: b.booth_id,
      code: b.code,
      name: b.name ?? "Help booth",
      zone: b.zone,
      lat: b.lat!,
      lng: b.lng!,
      phone: b.contact_phone,
    }));
}

export async function getDashboardData() {
  const [stats, missingQueue, foundQueue, matches, reunited] = await Promise.all([
    getStats(),
    getMissingQueue(),
    getFoundQueue(),
    getCandidateMatches(),
    getReunited(),
  ]);
  return { stats, missingQueue, foundQueue, matches, reunited };
}

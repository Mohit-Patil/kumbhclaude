import { supabase } from "./supabase";

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
};
export type MatchCard = {
  id: string;
  confidence: number;
  method: string;
  missingName: string;
  missingMeta: string;
  foundName: string;
  foundMeta: string;
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
};

/* ---------- raw embedded row shapes ---------- */
type PersonLite = {
  full_name: string | null;
  age: number | null;
  age_range: string | null;
  description: string | null;
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

/* ---------- helpers ---------- */
function timeAgo(ts: string | null): string {
  if (!ts) return "";
  const mins = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function displayName(p: PersonLite | null | undefined): string {
  if (!p) return "Unknown";
  if (p.full_name) return p.full_name;
  if (p.age_range) return `Unidentified · ${p.age_range}`;
  return "Unidentified";
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

export async function getMissingQueue(): Promise<QueueItem[]> {
  const { data } = await supabase
    .from("missing_report")
    .select(
      "missing_report_id,last_seen_to,created_at,booth:booth!missing_report_booth_id_fkey(code,zone),subject:person!missing_report_subject_person_id_fkey(full_name,age,age_range,description)",
    )
    .eq("status", "open")
    .order("last_seen_to", { ascending: false });
  const rows = (data ?? []) as unknown as MissingRow[];
  return rows.map((r) => ({
    id: r.missing_report_id,
    name: personLabel(r.subject),
    meta: [r.booth?.zone, r.subject?.description].filter(Boolean).join(" · "),
    ago: timeAgo(r.last_seen_to ?? r.created_at),
  }));
}

export async function getFoundQueue(): Promise<QueueItem[]> {
  const { data } = await supabase
    .from("found_report")
    .select(
      "found_report_id,found_at,created_at,booth:booth!found_report_booth_id_fkey(code,zone),subject:person!found_report_subject_person_id_fkey(full_name,age,age_range,description)",
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
  }));
}

export async function getCandidateMatches(): Promise<MatchCard[]> {
  const { data } = await supabase
    .from("match")
    .select(
      "match_id,confidence,match_method,missing:missing_report!match_missing_report_id_fkey(booth:booth!missing_report_booth_id_fkey(code),subject:person!missing_report_subject_person_id_fkey(full_name,age,age_range,description)),found:found_report!match_found_report_id_fkey(booth:booth!found_report_booth_id_fkey(code),subject:person!found_report_subject_person_id_fkey(full_name,age,age_range,description))",
    )
    .eq("status", "proposed")
    .order("confidence", { ascending: false });
  const rows = (data ?? []) as unknown as MatchRow[];
  return rows.map((r) => ({
    id: r.match_id,
    confidence: r.confidence ?? 0,
    method: r.match_method,
    missingName: personLabel(r.missing?.subject),
    missingMeta: r.missing?.booth?.code ? `Reported at ${r.missing.booth.code}` : "Missing",
    foundName: displayName(r.found?.subject),
    foundMeta: r.found?.booth?.code ? `Safe at ${r.found.booth.code}` : "Found",
  }));
}

export async function getReunited(): Promise<ReunitedItem[]> {
  const { data } = await supabase
    .from("match")
    .select(
      "match_id,match_method,resolved_at,missing:missing_report!match_missing_report_id_fkey(booth:booth!missing_report_booth_id_fkey(code),subject:person!missing_report_subject_person_id_fkey(full_name,age))",
    )
    .eq("status", "reunited")
    .order("resolved_at", { ascending: false });
  const rows = (data ?? []) as unknown as MatchRow[];
  return rows.map((r) => ({
    id: r.match_id,
    name: personLabel(r.missing?.subject),
    via: `${r.match_method === "aadhaar" ? "Aadhaar" : "Face"} match${r.missing?.booth?.code ? ` · Booth ${r.missing.booth.code}` : ""}`,
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

/**
 * Open missing/found reports placed on the map via their booth's coordinates.
 * Reports whose booth has no location are omitted (the map can't plot them).
 */
export async function getMapReports(): Promise<{ missing: MapReport[]; found: MapReport[] }> {
  const [missingRes, foundRes] = await Promise.all([
    supabase
      .from("missing_report")
      .select(
        "missing_report_id,last_seen_to,created_at,booth:booth!missing_report_booth_id_fkey(code,zone,lat,lng),subject:person!missing_report_subject_person_id_fkey(full_name,age,age_range,description)",
      )
      .eq("status", "open"),
    supabase
      .from("found_report")
      .select(
        "found_report_id,found_at,created_at,booth:booth!found_report_booth_id_fkey(code,zone,lat,lng),subject:person!found_report_subject_person_id_fkey(full_name,age,age_range,description)",
      )
      .eq("status", "open"),
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
      }),
    );

  return { missing, found };
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

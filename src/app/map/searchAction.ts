"use server";

import { supabase } from "@/lib/supabase";
import { searchMissing } from "@/lib/ai/searchMissing";
import type { SearchCandidate } from "@/lib/ai/searchPrompt";

export type MapSearchResult = { id: string; score: number; reason: string };

type MissingSearchRow = {
  missing_report_id: string;
  booth: { zone: string | null } | null;
  subject: {
    full_name: string | null;
    age: number | null;
    age_range: string | null;
    gender: string | null;
    description: string | null;
  } | null;
};

/** Server action: rank open missing reports against a free-text query via Claude. */
export async function searchMissingPersons(query: string): Promise<MapSearchResult[]> {
  if (!query.trim()) return [];

  const { data } = await supabase
    .from("missing_report")
    .select(
      "missing_report_id,booth:booth!missing_report_booth_id_fkey(zone),subject:person!missing_report_subject_person_id_fkey(full_name,age,age_range,gender,description)",
    )
    .eq("status", "open");

  const rows = (data ?? []) as unknown as MissingSearchRow[];
  const candidates: SearchCandidate[] = rows.map((r) => ({
    id: r.missing_report_id,
    name: r.subject?.full_name ?? null,
    age: r.subject?.age ?? null,
    ageRange: r.subject?.age_range ?? null,
    gender: r.subject?.gender ?? null,
    description: r.subject?.description ?? null,
    zone: r.booth?.zone ?? null,
  }));

  const results = await searchMissing(query, candidates);
  return results.map((r) => ({ id: r.id, score: r.score, reason: r.reason }));
}

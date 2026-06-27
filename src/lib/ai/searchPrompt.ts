/**
 * Pure prompt construction + ranking for AI map search. Free of the `ai` SDK so it
 * can be unit-tested without a network dependency.
 */
import { z } from "zod";

export type SearchCandidate = {
  id: string;
  name: string | null;
  age: number | null;
  ageRange: string | null;
  gender: string | null;
  description: string | null;
  zone: string | null;
};

function ageLabel(c: SearchCandidate): string {
  return c.age != null ? String(c.age) : c.ageRange ? `~${c.ageRange}` : "unknown";
}

export function buildSearchPrompt(query: string, candidates: SearchCandidate[]): string {
  const lines = candidates.map((c) =>
    [
      `- id: ${c.id}`,
      `  name: ${c.name ?? "Unidentified"}`,
      `  age: ${ageLabel(c)}`,
      `  gender: ${c.gender ?? "unknown"}`,
      `  zone: ${c.zone ?? "unknown"}`,
      `  description: ${c.description ?? "(none given)"}`,
    ].join("\n"),
  );
  return [
    "An operator is searching open missing-person reports at the Nashik Kumbh Mela.",
    "Descriptions may be in English, Hindi, or Marathi — treat them as equivalent across",
    "languages, and treat synonyms (e.g. red ≈ maroon ≈ लाल) as matches.",
    "",
    `SEARCH QUERY: ${query}`,
    "",
    "CANDIDATE missing-person reports:",
    ...lines,
    "",
    "Score how well each candidate matches the query from 0 (no match) to 1 (strong match).",
    "Return only candidates with a meaningful match, each with its id, score, and a",
    "one-sentence reason (max ~120 chars, in English).",
  ].join("\n");
}

export const SearchResultSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      score: z.number().min(0).max(1),
      reason: z.string(),
    }),
  ),
});
export type SearchResult = z.infer<typeof SearchResultSchema>["results"][number];

/** Filter by a minimum score and sort strongest-first. */
export function rankResults(results: SearchResult[], threshold = 0.3): SearchResult[] {
  return results.filter((r) => r.score >= threshold).sort((a, b) => b.score - a.score);
}

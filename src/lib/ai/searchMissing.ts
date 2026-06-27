import "server-only";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  buildSearchPrompt,
  rankResults,
  SearchResultSchema,
  type SearchCandidate,
  type SearchResult,
} from "./searchPrompt";

const model = anthropic("claude-haiku-4-5");

const SYSTEM =
  "You rank open missing-person reports by how well each matches an operator's free-text " +
  "search query at the Nashik Kumbh Mela. Be precise — do not invent matches, and only " +
  "return candidate ids that appear in the provided list.";

/** Rank candidates against the query with Claude. Returns sorted, thresholded matches. */
export async function searchMissing(
  query: string,
  candidates: SearchCandidate[],
): Promise<SearchResult[]> {
  if (!query.trim() || candidates.length === 0) return [];
  const { object } = await generateObject({
    model,
    schema: SearchResultSchema,
    system: SYSTEM,
    prompt: buildSearchPrompt(query, candidates),
  });
  const valid = new Set(candidates.map((c) => c.id));
  return rankResults(object.results.filter((r) => valid.has(r.id)));
}

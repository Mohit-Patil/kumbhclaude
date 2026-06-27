/**
 * Pure prompt construction for AI match scoring. Kept free of the `ai` SDK so it
 * can be unit-tested without a network dependency.
 */
import { z } from "zod";

export type ScorePartyInput = {
  name: string | null;
  age: number | null;
  ageRange: string | null;
  gender: string | null;
  description: string | null;
  zone: string | null;
};

export type NormalizedParty = {
  name: string;
  age: string;
  gender: string;
  description: string;
  zone: string;
};

export type MatchInput = { missing: NormalizedParty; found: NormalizedParty };

function normalize(p: ScorePartyInput): NormalizedParty {
  const age = p.age != null ? String(p.age) : p.ageRange ? `~${p.ageRange}` : "unknown";
  return {
    name: p.name ?? "Unidentified",
    age,
    gender: p.gender ?? "unknown",
    description: p.description ?? "(none given)",
    zone: p.zone ?? "unknown",
  };
}

export function buildMatchInput(missing: ScorePartyInput, found: ScorePartyInput): MatchInput {
  return { missing: normalize(missing), found: normalize(found) };
}

/** The Claude structured-output contract. */
export const MatchVerdictSchema = z.object({
  confidence: z.number().min(0).max(1),
  verdict: z.enum(["likely", "possible", "unlikely"]),
  rationale: z.string(),
});
export type MatchVerdict = z.infer<typeof MatchVerdictSchema>;

const party = (label: string, p: NormalizedParty) =>
  `${label}:\n- name: ${p.name}\n- age: ${p.age}\n- gender: ${p.gender}\n- zone: ${p.zone}\n- description: ${p.description}`;

export function renderMatchPrompt(input: MatchInput): string {
  return [
    "Two reports may describe the same person separated at the Nashik Kumbh Mela.",
    "Descriptions may be in English, Hindi, or Marathi — treat them as equivalent across languages,",
    "and treat synonyms and near-synonyms (e.g. red ≈ maroon ≈ लाल) as matches.",
    "",
    party("MISSING person report", input.missing),
    "",
    party("FOUND person report", input.found),
    "",
    "Judge whether these are the same person. Return a confidence (0-1), a verdict, and a",
    "one-sentence rationale (max ~140 characters, in English) citing the strongest signals.",
  ].join("\n");
}

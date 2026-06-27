import "server-only";
import { supabase } from "../supabase";
import { buildMatchInput, type ScorePartyInput } from "./matchPrompt";
import { scoreMatch } from "./scoreMatch";

export type ScorablePair = {
  missingReportId: string;
  foundReportId: string;
  missing: ScorePartyInput;
  found: ScorePartyInput;
};

export type ScoredExplanation = {
  missingReportId: string;
  foundReportId: string;
  ai_confidence: number;
  ai_verdict: string;
  ai_rationale: string;
};

/**
 * Score each pair with Claude and persist the verdict via the scoped upsert RPC.
 * Returns the successfully-scored explanations so the caller can merge them
 * immediately (no re-fetch race on the cold load). Best-effort: a failed pair is
 * skipped (logged) and never blocks the others or the dashboard render.
 */
export async function runMatchScoring(pairs: ScorablePair[]): Promise<ScoredExplanation[]> {
  if (pairs.length === 0) return [];
  const settled = await Promise.allSettled(
    pairs.map(async (p): Promise<ScoredExplanation> => {
      const v = await scoreMatch(buildMatchInput(p.missing, p.found));
      await supabase.rpc("upsert_match_explanation", {
        p_missing: p.missingReportId,
        p_found: p.foundReportId,
        p_conf: v.confidence,
        p_verdict: v.verdict,
        p_rationale: v.rationale,
        p_model: v.model,
      });
      return {
        missingReportId: p.missingReportId,
        foundReportId: p.foundReportId,
        ai_confidence: v.confidence,
        ai_verdict: v.verdict,
        ai_rationale: v.rationale,
      };
    }),
  );
  const scored: ScoredExplanation[] = [];
  for (let i = 0; i < settled.length; i++) {
    const r = settled[i];
    if (r.status === "fulfilled") scored.push(r.value);
    else console.error(`match scoring failed for ${pairs[i].missingReportId}/${pairs[i].foundReportId}:`, r.reason);
  }
  return scored;
}

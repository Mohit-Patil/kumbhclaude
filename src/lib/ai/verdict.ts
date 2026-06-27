/** Match-verdict vocabulary shared by the scorer and the UI. Pure helpers. */

export type Verdict = "likely" | "possible" | "unlikely";

/** Bucket a 0–1 confidence into a coarse verdict for display and ordering. */
export function bucketVerdict(confidence: number): Verdict {
  if (confidence >= 0.75) return "likely";
  if (confidence >= 0.45) return "possible";
  return "unlikely";
}

const LABELS: Record<Verdict, string> = {
  likely: "Likely",
  possible: "Possible",
  unlikely: "Unlikely",
};

export function verdictLabel(verdict: Verdict): string {
  return LABELS[verdict];
}

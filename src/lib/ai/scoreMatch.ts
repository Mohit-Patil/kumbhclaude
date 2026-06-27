import "server-only";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  MatchVerdictSchema,
  renderMatchPrompt,
  type MatchInput,
  type MatchVerdict,
} from "./matchPrompt";

/** Calls the Anthropic API directly via ANTHROPIC_API_KEY (no gateway). */
const MODEL_ID = "claude-haiku-4-5";
const model = anthropic(MODEL_ID);

const SYSTEM =
  "You are a careful reunification officer at the Nashik Kumbh Mela, matching missing-person " +
  "and found-person reports. Be conservative: only call a pair 'likely' when several attributes " +
  "align (age, gender, clothing/appearance, proximity). Disagreeing gender or a large age gap " +
  "should lower confidence sharply.";

export async function scoreMatch(input: MatchInput): Promise<MatchVerdict & { model: string }> {
  const { object } = await generateObject({
    model,
    schema: MatchVerdictSchema,
    system: SYSTEM,
    prompt: renderMatchPrompt(input),
  });
  return { ...object, model: MODEL_ID };
}

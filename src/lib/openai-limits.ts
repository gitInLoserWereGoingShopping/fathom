import fs from "node:fs";
import path from "node:path";

const EXAMPLE_RESPONSE_PATH = path.resolve(
  process.cwd(),
  "docs/examples/how-does-electricity-flow.json",
);

export const MAX_RESPONSE_TOKENS = 800;
const DEFAULT_MAX_TOKENS = MAX_RESPONSE_TOKENS;

export function estimateTokensFromChars(chars: number) {
  return Math.max(64, Math.ceil(chars / 4));
}

export function computeMaxTokensFromExamples(examples: unknown) {
  if (!examples || typeof examples !== "object") {
    return DEFAULT_MAX_TOKENS;
  }

  const entries = Object.values(examples as Record<string, unknown>);
  if (entries.length === 0) {
    return DEFAULT_MAX_TOKENS;
  }

  const maxChars = entries.reduce((currentMax, entry) => {
    const length = JSON.stringify(entry).length;
    return Math.max(currentMax, length);
  }, 0);

  const baseTokens = estimateTokensFromChars(maxChars);
  return Math.ceil(baseTokens * 1.5);
}

export function getResponseTokenLimit() {
  return DEFAULT_MAX_TOKENS;
}

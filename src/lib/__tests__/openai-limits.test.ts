import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  computeMaxTokensFromExamples,
  estimateTokensFromChars,
  getResponseTokenLimit,
  MAX_RESPONSE_TOKENS,
} from "@/lib/openai-limits";

const EXAMPLE_RESPONSE_PATH = path.resolve(
  process.cwd(),
  "docs/examples/how-does-electricity-flow.json",
);

describe("openai limits", () => {
  it("estimates tokens from character counts", () => {
    expect(estimateTokensFromChars(0)).toBe(64);
    expect(estimateTokensFromChars(400)).toBe(100);
  });

  it("computes max tokens from example responses with 50% headroom", () => {
    const raw = fs.readFileSync(EXAMPLE_RESPONSE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const maxChars = Math.max(
      ...Object.values(parsed).map((entry) => JSON.stringify(entry).length),
    );
    const expected = Math.ceil(Math.ceil(maxChars / 4) * 1.5);

    expect(computeMaxTokensFromExamples(parsed)).toBe(expected);
  });

  it("uses a fixed response token limit for runtime calls", () => {
    expect(getResponseTokenLimit()).toBe(MAX_RESPONSE_TOKENS);
  });
});

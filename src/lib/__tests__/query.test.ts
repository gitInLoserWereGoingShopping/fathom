import { describe, expect, it } from "vitest";
import { sanitizeQuery, hasControlChars } from "@/lib/query";
import { MAX_QUERY_CHARS } from "@/lib/limits";

describe("sanitizeQuery", () => {
  it("strips control characters and collapses whitespace", () => {
    const input = "Hello\u0000   world \u200B";
    const result = sanitizeQuery(input);
    expect(result).toBe("Hello world");
  });

  it("clamps to max length", () => {
    const input = "a".repeat(MAX_QUERY_CHARS + 20);
    const result = sanitizeQuery(input);
    expect(result.length).toBe(MAX_QUERY_CHARS);
  });
});

describe("hasControlChars", () => {
  it("detects control characters", () => {
    expect(hasControlChars("ok\u0007")).toBe(true);
  });

  it("returns false for clean input", () => {
    expect(hasControlChars("How does gravity work?")).toBe(false);
  });
});

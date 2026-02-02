import { describe, expect, it } from "vitest";
import { buildGroupKey, canonicalize } from "@/lib/canonicalize";

describe("canonicalize", () => {
  it("removes common prefixes and punctuation", () => {
    const result = canonicalize(
      "I'm interested in learning more about gravity!",
    );
    expect(result.canonicalTopic).toBe("gravity");
    expect(result.canonicalKey).toBe("gravity");
  });

  it("normalizes whitespace and casing", () => {
    const result = canonicalize("  Explain   Black   Holes?? ");
    expect(result.canonicalTopic).toBe("black holes");
    expect(result.canonicalKey).toBe("black holes");
  });
});

describe("buildGroupKey", () => {
  it("combines topic, level, and structure version", () => {
    const key = buildGroupKey("black holes", "eli5", "v1");
    expect(key).toBe("black holes|eli5|v1");
  });
});

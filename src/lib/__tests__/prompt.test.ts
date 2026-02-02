import { describe, expect, it } from "vitest";
import { buildPrompt } from "@/lib/prompt";

describe("buildPrompt", () => {
  it("includes the topic, level, and variation hint", () => {
    const prompt = buildPrompt({
      topic: "electricity flow",
      level: "eli10",
      variantHint: "Use a fresh metaphor.",
    });

    expect(prompt.userPrompt).toContain("Topic: electricity flow");
    expect(prompt.userPrompt).toContain("Level: eli10");
    expect(prompt.userPrompt).toContain(
      "Variation hint: Use a fresh metaphor.",
    );
  });

  it("includes allowed block types", () => {
    const prompt = buildPrompt({
      topic: "gravity",
      level: "eli5",
    });

    expect(prompt.userPrompt).toContain("Block types allowed");
    expect(prompt.userPrompt).toContain("paragraph");
    expect(prompt.userPrompt).toContain("equation");
  });
});

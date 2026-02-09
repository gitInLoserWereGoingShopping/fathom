import { describe, expect, it } from "vitest";
import { ExplanationSchema, ExplainRequestSchema } from "@/lib/schema";
import { MAX_QUERY_CHARS } from "@/lib/limits";

describe("ExplanationSchema", () => {
  it("validates a well-formed explanation", () => {
    const result = ExplanationSchema.safeParse({
      topic: "how does electricity flow",
      level: "eli5",
      title: "Electricity is like a moving crowd",
      summary:
        "Electricity flows when tiny charges move together in a loop, like a crowd passing a message.",
      blocks: [
        {
          type: "analogy",
          title: "Crowd in a hallway",
          text: "Imagine a hallway full of people shifting together as a signal moves along.",
        },
        {
          type: "steps",
          title: "What needs to happen",
          items: [
            "You need a path for charges to move through.",
            "You need a push to get them moving.",
          ],
        },
        {
          type: "intuition",
          title: "The loop matters",
          text: "If the loop is broken, the charges can’t keep moving, so the flow stops.",
        },
      ],
      relatedTopics: ["What is a circuit?", "What does a battery do?"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid block types", () => {
    const result = ExplanationSchema.safeParse({
      topic: "entropy",
      level: "eli10",
      title: "Entropy overview",
      summary: "A brief summary of entropy.",
      blocks: [
        {
          type: "unknown",
          text: "Not valid",
        },
      ],
      relatedTopics: ["Second law", "Thermodynamics"],
    });

    expect(result.success).toBe(false);
  });
});

describe("ExplainRequestSchema", () => {
  it("accepts valid input", () => {
    const result = ExplainRequestSchema.safeParse({
      query: "How does electricity flow?",
      level: "eli10",
      mode: "default",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing query", () => {
    const result = ExplainRequestSchema.safeParse({
      level: "eli10",
    });

    expect(result.success).toBe(false);
  });

  it("rejects overly long queries", () => {
    const result = ExplainRequestSchema.safeParse({
      query: "a".repeat(MAX_QUERY_CHARS + 1),
      level: "eli10",
    });

    expect(result.success).toBe(false);
  });

  it("rejects queries with control characters", () => {
    const result = ExplainRequestSchema.safeParse({
      query: "Why does it rain?\u0000",
      level: "eli10",
    });

    expect(result.success).toBe(false);
  });
});

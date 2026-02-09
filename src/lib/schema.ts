import { z } from "zod";
import { MAX_QUERY_CHARS } from "@/lib/limits";
import { hasControlChars } from "@/lib/query";

export const ExplanationLevelSchema = z.enum(["eli5", "eli10", "expert"]);

export const ExplanationBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    text: z.string().min(2),
  }),
  z.object({
    type: z.literal("paragraph"),
    text: z.string().min(10),
  }),
  z.object({
    type: z.literal("analogy"),
    title: z.string().min(2).optional(),
    text: z.string().min(20),
  }),
  z.object({
    type: z.literal("steps"),
    title: z.string().min(2).optional(),
    items: z.array(z.string().min(5)).min(2),
  }),
  z.object({
    type: z.literal("intuition"),
    title: z.string().min(2).optional(),
    text: z.string().min(20),
  }),
  z.object({
    type: z.literal("technical"),
    title: z.string().min(2).optional(),
    text: z.string().min(20),
  }),
  z.object({
    type: z.literal("equation"),
    latex: z.string().min(3),
    explanation: z.string().min(5).optional(),
  }),
  z.object({
    type: z.literal("callout"),
    tone: z.enum(["tip", "note", "warning"]),
    text: z.string().min(10),
  }),
  z.object({
    type: z.literal("check"),
    questions: z.array(z.string().min(5)).min(1),
  }),
]);

export const ExplanationSchema = z.object({
  topic: z.string().min(2),
  level: ExplanationLevelSchema,
  title: z.string().min(4),
  summary: z.string().min(20),
  blocks: z.array(ExplanationBlockSchema).min(3),
  relatedTopics: z.array(z.string().min(2)).min(2).max(6),
});

export type ExplanationLevel = z.infer<typeof ExplanationLevelSchema>;
export type ExplanationBlock = z.infer<typeof ExplanationBlockSchema>;
export type Explanation = z.infer<typeof ExplanationSchema>;

export const ExplainRequestSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2)
    .max(MAX_QUERY_CHARS)
    .refine((value) => !hasControlChars(value), {
      message: "Query contains invalid characters.",
    }),
  level: ExplanationLevelSchema,
  mode: z.enum(["default", "new_variant"]).optional(),
});

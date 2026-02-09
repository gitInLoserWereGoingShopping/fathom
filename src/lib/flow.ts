import { prisma } from "@/lib/db";
import { buildGroupKey, canonicalize } from "@/lib/canonicalize";
import {
  ExplanationSchema,
  type Explanation,
  type ExplanationLevel,
} from "@/lib/schema";
import { buildPrompt, STRUCTURE_VERSION } from "@/lib/prompt";
import { callOpenAI } from "@/lib/openai";
import { sanitizeQuery } from "@/lib/query";

export type FlowMode = "default" | "new_variant";
export type FlowStatus = "success" | "retrieved" | "failed";

export type FlowResult = {
  status: FlowStatus;
  cacheHit: boolean;
  flowRunId: string;
  explanation?: Explanation;
  explanationId?: string;
  variantId?: string;
  message?: string;
};

type FlowTrace = {
  input: {
    rawQuery: string;
    level: ExplanationLevel;
    mode: FlowMode;
  };
  canonicalise: {
    input: string;
    canonicalTopic: string;
    canonicalKey: string;
    groupKey: string;
  };
  retrieval: {
    hit: boolean;
    explanationId?: string;
    variantId?: string;
    visibility?: string;
    groupKey: string;
    matchingKeys?: string[];
  };
  promptBuild?: {
    systemPrompt: string;
    userPrompt: string;
    fullPrompt: string;
  };
  modelCall?: {
    model: string;
    rawOutput: string;
  };
  parse?: {
    success: boolean;
    parsedJson?: Explanation;
    error?: string;
  };
  validation?: {
    success: boolean;
    errors?: string[];
  };
  renderPreview?: {
    blockTypes: Array<{ type: string; supported: boolean }>;
    unknownBlocks: string[];
  };
  persist?: {
    explanationId?: string;
    variantId?: string;
  };
  error?: string;
};

const supportedBlockTypes = new Set([
  "heading",
  "paragraph",
  "analogy",
  "steps",
  "intuition",
  "technical",
  "equation",
  "callout",
  "check",
]);

function suggestVariantHint(groupKey: string) {
  const hints = [
    "Use a fresh metaphor that avoids water or plumbing.",
    "Emphasize a different physical intuition.",
    "Swap the ordering of steps to vary the flow.",
    "Use a concrete everyday example that is not about cars.",
  ];
  let hash = 0;
  for (let i = 0; i < groupKey.length; i += 1) {
    hash = (hash * 31 + groupKey.charCodeAt(i)) % hints.length;
  }
  return hints[hash];
}

function safeJsonParse(raw: string) {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/```json([\s\S]*?)```/i);
  const candidate = jsonMatch ? jsonMatch[1].trim() : trimmed;
  return JSON.parse(candidate);
}

function normalizeExplanation(
  input: Explanation,
  params: {
    canonicalTopic: string;
    level: ExplanationLevel;
  },
): Explanation {
  const normalizedBlocks = input.blocks.map((block) => {
    if ("type" in block) {
      if (block.type === "callout") {
        const tone =
          block.tone === "tip" ||
          block.tone === "note" ||
          block.tone === "warning"
            ? block.tone
            : "note";
        return { ...block, tone };
      }
      return block;
    }

    const entries = Object.entries(block as Record<string, unknown>);
    if (entries.length !== 1) {
      return block;
    }

    const [key, value] = entries[0];
    if (typeof value !== "object" || value === null) {
      return block;
    }

    return {
      type: key,
      ...(value as Record<string, unknown>),
    } as Explanation["blocks"][number];
  });

  return {
    ...input,
    topic: input.topic ?? params.canonicalTopic,
    level: input.level ?? params.level,
    blocks: normalizedBlocks,
  } as Explanation;
}

export async function runFlow(params: {
  rawQuery: string;
  level: ExplanationLevel;
  mode?: FlowMode;
  forceGenerate?: boolean;
}) {
  const mode = params.mode ?? "default";
  const sanitizedQuery = sanitizeQuery(params.rawQuery);
  const trace: FlowTrace = {
    input: {
      rawQuery: sanitizedQuery,
      level: params.level,
      mode,
    },
    canonicalise: {
      input: sanitizedQuery,
      canonicalTopic: "",
      canonicalKey: "",
      groupKey: "",
    },
    retrieval: {
      hit: false,
      groupKey: "",
      matchingKeys: [],
    },
  };

  try {
    const { canonicalTopic, canonicalKey } = canonicalize(sanitizedQuery);
    const groupKey = buildGroupKey(
      canonicalTopic,
      params.level,
      STRUCTURE_VERSION,
    );

    trace.canonicalise = {
      input: params.rawQuery,
      canonicalTopic,
      canonicalKey,
      groupKey,
    };

    trace.retrieval.groupKey = groupKey;

    const publicExplanation = await prisma.explanation.findFirst({
      where: {
        groupKey,
        level: params.level,
        visibility: "public",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const existingExplanation =
      publicExplanation ??
      (await prisma.explanation.findFirst({
        where: {
          groupKey,
          level: params.level,
          visibility: {
            not: "blocked",
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }));

    if (existingExplanation && mode === "default" && !params.forceGenerate) {
      const bestVariant = await prisma.explanationVariant.findFirst({
        where: {
          explanationId: existingExplanation.id,
        },
        orderBy: [{ helpfulScore: "desc" }, { createdAt: "desc" }],
      });

      trace.retrieval = {
        hit: true,
        explanationId: existingExplanation.id,
        variantId: bestVariant?.id,
        visibility: existingExplanation.visibility,
        groupKey,
        matchingKeys: [groupKey],
      };

      const flowRun = await prisma.flowRun.create({
        data: {
          rawQuery: params.rawQuery,
          level: params.level,
          status: "retrieved",
          cacheHit: true,
          canonicalTopic,
          groupKey,
          trace,
        },
      });

      const explanation = (bestVariant?.content ??
        existingExplanation.content) as Explanation;

      return {
        status: "retrieved",
        cacheHit: true,
        flowRunId: flowRun.id,
        explanation,
        explanationId: existingExplanation.id,
        variantId: bestVariant?.id,
      } satisfies FlowResult;
    }

    const variantHint =
      mode === "new_variant" ? suggestVariantHint(groupKey) : null;
    const prompt = buildPrompt({
      topic: canonicalTopic,
      level: params.level,
      variantHint,
    });

    trace.promptBuild = prompt;

    const rawOutput = await callOpenAI({
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
    });

    trace.modelCall = {
      model: "gpt-4o-mini",
      rawOutput,
    };

    let parsed: Explanation | null = null;
    try {
      const parsedJson = safeJsonParse(rawOutput) as Explanation;
      parsed = parsedJson;
      trace.parse = { success: true, parsedJson };
    } catch (error) {
      trace.parse = {
        success: false,
        error: error instanceof Error ? error.message : "JSON parse error",
      };
    }

    if (!parsed) {
      throw new Error("Failed to parse model response as JSON.");
    }

    const normalized = normalizeExplanation(parsed, {
      canonicalTopic,
      level: params.level,
    });

    const validation = ExplanationSchema.safeParse(normalized);

    if (!validation.success) {
      trace.validation = {
        success: false,
        errors: validation.error.issues.map((issue) => issue.message),
      };
      throw new Error("Model response failed schema validation.");
    }

    trace.validation = { success: true };

    const blockTypes = normalized.blocks.map((block) => ({
      type: block.type,
      supported: supportedBlockTypes.has(block.type),
    }));
    const unknownBlocks = blockTypes
      .filter((block) => !block.supported)
      .map((block) => block.type);

    trace.renderPreview = {
      blockTypes,
      unknownBlocks,
    };

    const explanationRecord =
      existingExplanation ??
      (await prisma.explanation.create({
        data: {
          canonicalKey,
          canonicalTopic,
          groupKey,
          level: params.level,
          structureVersion: STRUCTURE_VERSION,
          content: normalized,
          visibility: "private",
        },
      }));

    const variantRecord = await prisma.explanationVariant.create({
      data: {
        explanationId: explanationRecord.id,
        groupKey,
        variantLabel: mode === "new_variant" ? "variant" : "base",
        content: normalized,
        metadata: {
          level: params.level,
          mode,
          variantHint,
        },
        metaphorTags: [],
      },
    });

    await prisma.explanation.update({
      where: { id: explanationRecord.id },
      data: {
        content: normalized,
        updatedAt: new Date(),
      },
    });

    trace.persist = {
      explanationId: explanationRecord.id,
      variantId: variantRecord.id,
    };

    const flowRun = await prisma.flowRun.create({
      data: {
        rawQuery: params.rawQuery,
        level: params.level,
        status: "success",
        cacheHit: false,
        canonicalTopic,
        groupKey,
        trace,
      },
    });

    return {
      status: "success",
      cacheHit: false,
      flowRunId: flowRun.id,
      explanation: normalized,
      explanationId: explanationRecord.id,
      variantId: variantRecord.id,
    } satisfies FlowResult;
  } catch (error) {
    trace.error = error instanceof Error ? error.message : "Unknown error";

    const flowRun = await prisma.flowRun.create({
      data: {
        rawQuery: params.rawQuery,
        level: params.level,
        status: "failed",
        cacheHit: false,
        canonicalTopic: trace.canonicalise.canonicalTopic || undefined,
        groupKey: trace.canonicalise.groupKey || undefined,
        errorMessage: trace.error,
        trace,
      },
    });

    return {
      status: "failed",
      cacheHit: false,
      flowRunId: flowRun.id,
      message:
        "Something went wrong while generating the explanation. Please try again in a moment.",
    } satisfies FlowResult;
  }
}

export async function checkExplainCache(params: {
  rawQuery: string;
  level: ExplanationLevel;
}) {
  const sanitizedQuery = sanitizeQuery(params.rawQuery);
  const { canonicalTopic } = canonicalize(sanitizedQuery);
  const groupKey = buildGroupKey(canonicalTopic, params.level, STRUCTURE_VERSION);

  const publicExplanation = await prisma.explanation.findFirst({
    where: {
      groupKey,
      level: params.level,
      visibility: "public",
    },
    select: { id: true },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (publicExplanation) {
    return true;
  }

  const existingExplanation = await prisma.explanation.findFirst({
    where: {
      groupKey,
      level: params.level,
      visibility: {
        not: "blocked",
      },
    },
    select: { id: true },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return Boolean(existingExplanation);
}

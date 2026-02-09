import "dotenv/config";
import { prisma } from "@/lib/db";
import {
  estimateTokensFromChars,
  getResponseTokenLimit,
} from "@/lib/openai-limits";

type TokenStat = {
  source: "explanation" | "variant";
  id: string;
  groupKey: string | null;
  level: string | null;
  tokens: number;
  chars: number;
};

function toTokenStat(params: {
  source: TokenStat["source"];
  id: string;
  groupKey?: string | null;
  level?: string | null;
  payload: unknown;
}): TokenStat {
  const chars = JSON.stringify(params.payload).length;
  const tokens = estimateTokensFromChars(chars);
  return {
    source: params.source,
    id: params.id,
    groupKey: params.groupKey ?? null,
    level: params.level ?? null,
    tokens,
    chars,
  };
}

async function run() {
  const tokenLimit = getResponseTokenLimit();

  const explanations = await prisma.explanation.findMany({
    select: {
      id: true,
      groupKey: true,
      level: true,
      content: true,
    },
  });

  const variants = await prisma.explanationVariant.findMany({
    select: {
      id: true,
      groupKey: true,
      content: true,
      explanation: {
        select: {
          level: true,
        },
      },
    },
  });

  const stats: TokenStat[] = [
    ...explanations.map((item) =>
      toTokenStat({
        source: "explanation",
        id: item.id,
        groupKey: item.groupKey,
        level: item.level,
        payload: item.content,
      }),
    ),
    ...variants.map((item) =>
      toTokenStat({
        source: "variant",
        id: item.id,
        groupKey: item.groupKey,
        level: item.explanation?.level ?? null,
        payload: item.content,
      }),
    ),
  ];

  const maxTokens = stats.reduce((max, item) => Math.max(max, item.tokens), 0);
  const overLimit = stats.filter((item) => item.tokens > tokenLimit);
  const sortedOver = [...overLimit].sort((a, b) => b.tokens - a.tokens);

  process.stdout.write(`Token limit: ${tokenLimit}\n`);
  process.stdout.write(
    `Scanned: ${stats.length} cached responses (${explanations.length} explanations, ${variants.length} variants)\n`,
  );
  process.stdout.write(`Max estimated tokens: ${maxTokens}\n`);

  if (overLimit.length === 0) {
    const headroom = tokenLimit - maxTokens;
    process.stdout.write(
      `All cached responses fit. Headroom vs max: ${headroom} tokens.\n`,
    );
    return;
  }

  process.stdout.write(
    `Found ${overLimit.length} cached responses exceeding the limit.\n`,
  );
  const sample = sortedOver.slice(0, 10);
  for (const item of sample) {
    const delta = item.tokens - tokenLimit;
    process.stdout.write(
      `- ${item.source} ${item.id} (${item.level ?? "unknown"}) ${item.groupKey ?? ""} +${delta} tokens (estimated ${item.tokens})\n`,
    );
  }
}

run()
  .catch((error) => {
    const message = error instanceof Error ? error.message : "unknown error";
    process.stderr.write(`Check failed: ${message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

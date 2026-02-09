import "dotenv/config";
import { DOMAIN_DEFINITIONS } from "@/lib/domains";
import { prisma } from "@/lib/db";
import { buildGroupKey, canonicalize } from "@/lib/canonicalize";
import { STRUCTURE_VERSION } from "@/lib/prompt";
import type { ExplanationLevel } from "@/lib/schema";

const levels: ExplanationLevel[] = ["eli5", "eli10", "expert"];

async function run() {
  const topics = DOMAIN_DEFINITIONS.flatMap((domain) => domain.topics);
  const missing: Array<{ topic: string; level: ExplanationLevel }> = [];

  for (const topic of topics) {
    for (const level of levels) {
      const { canonicalTopic } = canonicalize(topic);
      const groupKey = buildGroupKey(canonicalTopic, level, STRUCTURE_VERSION);
      const existing = await prisma.explanation.findFirst({
        where: { groupKey, level },
        select: { id: true },
      });
      if (!existing) {
        missing.push({ topic, level });
      }
    }
  }

  if (missing.length === 0) {
    process.stdout.write("All topics seeded for all levels.\n");
    return;
  }

  const grouped = new Map<string, ExplanationLevel[]>();
  for (const item of missing) {
    const entry = grouped.get(item.topic) ?? [];
    entry.push(item.level);
    grouped.set(item.topic, entry);
  }

  process.stdout.write(`Missing ${missing.length} topic/level pairs:\n`);
  for (const [topic, topicLevels] of grouped.entries()) {
    process.stdout.write(`- ${topic}: ${topicLevels.join(", ")}\n`);
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

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { DOMAIN_DEFINITIONS } from "@/lib/domains";
import { runFlow } from "@/lib/flow";
import { prisma } from "@/lib/db";
import { buildGroupKey, canonicalize } from "@/lib/canonicalize";
import { STRUCTURE_VERSION } from "@/lib/prompt";
import type { ExplanationLevel } from "@/lib/schema";

const levels: ExplanationLevel[] = ["eli5", "eli10", "expert"];

async function run() {
  const lockPath = path.resolve(process.cwd(), ".seed.lock");
  if (fs.existsSync(lockPath)) {
    process.stderr.write(
      "Seed lock detected (.seed.lock). Remove it to run seeding.\n",
    );
    process.exit(1);
  }
  fs.writeFileSync(
    lockPath,
    `started ${new Date().toISOString()}\n`,
    "utf8",
  );

  const topics = DOMAIN_DEFINITIONS.flatMap((domain) => domain.topics);
  const start = Number.parseInt(process.env.SEED_START ?? "0", 10);
  const limit = Number.parseInt(process.env.SEED_LIMIT ?? "", 10);
  const slice = Number.isFinite(limit)
    ? topics.slice(start, start + limit)
    : topics.slice(start);

  if (slice.length === 0) {
    process.stdout.write("No topics to seed (check SEED_START/SEED_LIMIT).\n");
    return;
  }

  try {
    for (const topic of slice) {
      for (const level of levels) {
        const { canonicalTopic } = canonicalize(topic);
        const groupKey = buildGroupKey(canonicalTopic, level, STRUCTURE_VERSION);
        const existing = await prisma.explanation.findFirst({
          where: { groupKey, level },
          select: { id: true },
        });
        if (existing) {
          process.stdout.write(
            `Skipping "${topic}" (${level}) — already exists.\n`,
          );
          continue;
        }

        process.stdout.write(`Seeding "${topic}" (${level})... `);
        try {
          await runFlow({
            rawQuery: topic,
            level,
            mode: "default",
          });
          process.stdout.write("done\n");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "unknown error";
          process.stdout.write(`failed (${message})\n`);
        }
        const jitter = Math.floor(Math.random() * 9) + 1;
        const delayMs = (25 + jitter) * 1000;
        process.stdout.write(`Waiting ${25 + jitter}s...\n`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  } finally {
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  }
}

run()
  .then(() => {
    process.stdout.write("Seed complete.\n");
    process.exit(0);
  })
  .catch((error) => {
    const message = error instanceof Error ? error.message : "unknown error";
    process.stderr.write(`Seed failed: ${message}\n`);
    process.exit(1);
  });

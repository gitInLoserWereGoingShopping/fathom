import "dotenv/config";
import { DOMAIN_DEFINITIONS } from "@/lib/domains";
import { runFlow } from "@/lib/flow";
import type { ExplanationLevel } from "@/lib/schema";

const levels: ExplanationLevel[] = ["eli5", "eli10", "expert"];

async function run() {
  const topics = DOMAIN_DEFINITIONS.flatMap((domain) => domain.topics);
  for (const topic of topics) {
    for (const level of levels) {
      process.stdout.write(`Seeding "${topic}" (${level})... `);
      try {
        await runFlow({
          rawQuery: topic,
          level,
          mode: "default",
          forceGenerate: true,
        });
        process.stdout.write("done\n");
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        process.stdout.write(`failed (${message})\n`);
      }
      const jitter = Math.floor(Math.random() * 9) + 1;
      const delayMs = (25 + jitter) * 1000;
      process.stdout.write(`Waiting ${25 + jitter}s...\n`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
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

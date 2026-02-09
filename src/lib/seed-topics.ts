import { DOMAIN_DEFINITIONS } from "@/lib/domains";

export const seedTopics = DOMAIN_DEFINITIONS.flatMap((domain) =>
  domain.questions.map((question) => question),
);

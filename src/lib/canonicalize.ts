const CLEANUP_PREFIXES = [
  "i'm interested in learning more about",
  "i am interested in learning more about",
  "i want to learn about",
  "teach me about",
  "explain",
  "explain to me",
];

export function canonicalize(rawQuery: string) {
  const normalized = rawQuery
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[?.!]+$/, "")
    .toLowerCase();

  const withoutPrefix = CLEANUP_PREFIXES.reduce((acc, prefix) => {
    return acc.startsWith(prefix) ? acc.slice(prefix.length).trim() : acc;
  }, normalized);

  const canonicalTopic = withoutPrefix.length > 0 ? withoutPrefix : normalized;
  const canonicalKey = canonicalTopic.replace(/[^a-z0-9\s-]/g, "").trim();

  return {
    canonicalTopic,
    canonicalKey,
  };
}

export function buildGroupKey(
  canonicalTopic: string,
  level: string,
  structureVersion = "v1",
) {
  return `${canonicalTopic}|${level}|${structureVersion}`;
}

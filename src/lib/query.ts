import { MAX_QUERY_CHARS } from "@/lib/limits";

const CONTROL_CHARS_REPLACE = /[\u0000-\u001F\u007F]/g;
const ZERO_WIDTH_CHARS_REPLACE = /[\u200B-\u200F\uFEFF]/g;
const CONTROL_CHARS_TEST = /[\u0000-\u001F\u007F]/;
const ZERO_WIDTH_CHARS_TEST = /[\u200B-\u200F\uFEFF]/;

export function sanitizeQuery(input: string, maxLength = MAX_QUERY_CHARS) {
  const normalized = input.normalize ? input.normalize("NFKC") : input;
  const stripped = normalized
    .replace(CONTROL_CHARS_REPLACE, "")
    .replace(ZERO_WIDTH_CHARS_REPLACE, "")
    .replace(/\s+/g, " ")
    .trim();

  return stripped.slice(0, maxLength);
}

export function hasControlChars(input: string) {
  return CONTROL_CHARS_TEST.test(input) || ZERO_WIDTH_CHARS_TEST.test(input);
}

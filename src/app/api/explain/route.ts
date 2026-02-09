import { NextResponse } from "next/server";
import { ExplainRequestSchema } from "@/lib/schema";
import { checkExplainCache, runFlow } from "@/lib/flow";
import { MAX_QUERY_CHARS } from "@/lib/limits";
import { sanitizeQuery } from "@/lib/query";
import { getClientIp } from "@/lib/request";
import { checkRateLimit } from "@/lib/rate-limit";
import { applySessionCookie, ensureSessionId } from "@/lib/session";

export async function POST(request: Request) {
  const session = ensureSessionId(request);
  const clientIp = getClientIp(request);
  const { searchParams } = new URL(request.url);
  const forceLimit = searchParams.get("forceLimit");
  const body = await request.json().catch(() => null);
  const parsed = ExplainRequestSchema.safeParse(body);

  if (!parsed.success) {
    const response = NextResponse.json(
      {
        status: "failed",
        message: "Please provide a topic and level.",
      },
      { status: 400 },
    );
    return applySessionCookie(response, session);
  }

  const sanitizedQuery = sanitizeQuery(parsed.data.query, MAX_QUERY_CHARS);
  if (sanitizedQuery.length < 2) {
    const response = NextResponse.json(
      {
        status: "failed",
        message: "Please provide a topic and level.",
      },
      { status: 400 },
    );
    return applySessionCookie(response, session);
  }

  let isCacheHit = false;
  if (parsed.data.mode !== "new_variant") {
    isCacheHit = await checkExplainCache({
      rawQuery: sanitizedQuery,
      level: parsed.data.level,
    });
  }

  if (
    process.env.NODE_ENV !== "production" &&
    forceLimit === "1" &&
    !isCacheHit
  ) {
    const response = NextResponse.json(
      {
        status: "failed",
        message: "Too many requests. Please try again shortly.",
        limitScope: "generate",
      },
      { status: 429 },
    );
    return applySessionCookie(response, session);
  }

  const limiterKey = session.id ? `session:${session.id}` : `ip:${clientIp}`;
  const rateLimit = checkRateLimit({
    key: `explain:${limiterKey}:${isCacheHit ? "cached" : "generate"}`,
    limit: isCacheHit ? 10 : 8,
    windowMs: isCacheHit ? 60_000 : 24 * 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      {
        status: "failed",
        message: "Too many requests. Please try again shortly.",
        limitScope: isCacheHit ? "cached" : "generate",
      },
      { status: 429 },
    );
    return applySessionCookie(response, session);
  }

  const result = await runFlow({
    rawQuery: sanitizedQuery,
    level: parsed.data.level,
    mode: parsed.data.mode ?? "default",
  });

  const response = NextResponse.json(result);
  return applySessionCookie(response, session);
}

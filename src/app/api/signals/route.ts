import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { checkRateLimit } from "@/lib/rate-limit";
import { applySessionCookie, ensureSessionId } from "@/lib/session";

const SignalSchema = z.object({
  explanationId: z.string().min(1).optional(),
  variantId: z.string().min(1).optional(),
  signalType: z.enum(["helpful", "tooComplex", "branched"]),
});

export async function POST(request: Request) {
  const session = ensureSessionId(request);
  const clientIp = getClientIp(request);
  const limiterKey = session.id ? `session:${session.id}` : `ip:${clientIp}`;
  const rateLimit = checkRateLimit({
    key: `signal:${limiterKey}`,
    limit: 5,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      { ok: false, message: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
    return applySessionCookie(response, session);
  }

  const body = await request.json().catch(() => null);
  const parsed = SignalSchema.safeParse(body);

  if (!parsed.success) {
    const response = NextResponse.json(
      { ok: false, message: "Invalid signal." },
      { status: 400 },
    );
    return applySessionCookie(response, session);
  }

  const signal = await prisma.signal.create({
    data: {
      explanationId: parsed.data.explanationId,
      variantId: parsed.data.variantId,
      signalType: parsed.data.signalType,
    },
  });

  if (parsed.data.signalType === "helpful" && parsed.data.variantId) {
    await prisma.explanationVariant.update({
      where: { id: parsed.data.variantId },
      data: { helpfulScore: { increment: 1 } },
    });
  }

  const response = NextResponse.json({ ok: true, id: signal.id });
  return applySessionCookie(response, session);
}

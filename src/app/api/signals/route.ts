import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const SignalSchema = z.object({
  explanationId: z.string().min(1).optional(),
  variantId: z.string().min(1).optional(),
  signalType: z.enum(["helpful", "tooComplex", "branched"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = SignalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid signal." },
      { status: 400 },
    );
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

  return NextResponse.json({ ok: true, id: signal.id });
}

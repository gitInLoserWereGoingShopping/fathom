import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const FeedbackSchema = z.object({
  message: z.string().min(3).max(2000),
});

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = FeedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid feedback." },
      { status: 400 },
    );
  }

  const feedback = await prisma.feedback.create({
    data: {
      message: parsed.data.message,
      reporterIp: getClientIp(request),
    },
  });

  return NextResponse.json({ ok: true, id: feedback.id });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/request";

const ReportSchema = z.object({
  explanationId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  reason: z.string().min(8).max(1000),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ReportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid report." },
      { status: 400 },
    );
  }

  const reporterIp = getClientIp(request);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const reportCount = await prisma.report.count({
    where: {
      reporterIp,
      createdAt: { gte: since },
    },
  });

  if (reportCount >= 3) {
    return NextResponse.json(
      { ok: false, message: "Daily report limit reached." },
      { status: 429 },
    );
  }

  const report = await prisma.report.create({
    data: {
      explanationId: parsed.data.explanationId,
      variantId: parsed.data.variantId,
      reason: parsed.data.reason,
      reporterIp,
      status: "open",
    },
  });

  await prisma.explanation.update({
    where: { id: parsed.data.explanationId },
    data: { visibility: "blocked" },
  });

  return NextResponse.json({ ok: true, id: report.id });
}

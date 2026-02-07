import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminSecretValid } from "@/lib/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const { id } = await params;

  if (!isAdminSecretValid(secret)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const report = await prisma.report.findUnique({
    where: { id },
  });

  if (!report) {
    return NextResponse.json(
      { message: "Report not found" },
      { status: 404 },
    );
  }

  await prisma.explanation.update({
    where: { id: report.explanationId },
    data: { visibility: "public" },
  });

  await prisma.report.update({
    where: { id },
    data: { status: "resolved" },
  });

  return NextResponse.json({ ok: true, id: report.id });
}

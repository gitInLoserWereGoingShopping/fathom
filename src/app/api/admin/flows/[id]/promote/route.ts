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

  const flowRun = await prisma.flowRun.findUnique({
    where: { id },
  });

  if (!flowRun) {
    return NextResponse.json(
      { message: "Flow run not found" },
      { status: 404 },
    );
  }

  const trace = flowRun.trace as {
    persist?: { explanationId?: string };
  };

  const explanationId = trace.persist?.explanationId;
  if (!explanationId) {
    return NextResponse.json(
      { message: "No explanation found to promote" },
      { status: 400 },
    );
  }

  const explanation = await prisma.explanation.update({
    where: { id: explanationId },
    data: { visibility: "public" },
  });

  return NextResponse.json({ ok: true, explanationId: explanation.id });
}

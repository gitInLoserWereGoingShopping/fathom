import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminSecretValid } from "@/lib/admin";
import { runFlow } from "@/lib/flow";

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
    input?: { rawQuery: string; level: "eli5" | "eli10" | "expert" };
  };

  if (!trace.input) {
    return NextResponse.json(
      { message: "Missing flow input" },
      { status: 400 },
    );
  }

  const result = await runFlow({
    rawQuery: trace.input.rawQuery,
    level: trace.input.level,
    mode: "default",
    forceGenerate: true,
  });

  return NextResponse.json(result);
}

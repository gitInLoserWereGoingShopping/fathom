import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminSecretValid } from "@/lib/admin";
import { runFlow } from "@/lib/flow";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!isAdminSecretValid(secret)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const flowRun = await prisma.flowRun.findUnique({
    where: { id: params.id },
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
    mode: "new_variant",
  });

  return NextResponse.json(result);
}

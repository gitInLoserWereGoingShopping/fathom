import { NextResponse } from "next/server";
import { ExplainRequestSchema } from "@/lib/schema";
import { runFlow } from "@/lib/flow";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ExplainRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "failed",
        message: "Please provide a topic and level.",
      },
      { status: 400 },
    );
  }

  const result = await runFlow({
    rawQuery: parsed.data.query,
    level: parsed.data.level,
    mode: parsed.data.mode ?? "default",
  });

  return NextResponse.json(result);
}

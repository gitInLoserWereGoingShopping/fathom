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

  const report = await prisma.report.update({
    where: { id },
    data: { status: "resolved" },
  });

  return NextResponse.json({ ok: true, id: report.id });
}

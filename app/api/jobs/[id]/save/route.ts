import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await db.savedJob.findUnique({
    where: { jobId_userId: { jobId: id, userId: session.user.id } },
  });

  if (existing) {
    await db.savedJob.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await db.savedJob.create({
    data: { jobId: id, userId: session.user.id },
  });

  return NextResponse.json({ saved: true });
}
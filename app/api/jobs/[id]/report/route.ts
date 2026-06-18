import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;
  const { reason, details } = await req.json();

  if (!reason || !reason.trim()) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }

  try {
    const report = await db.jobReport.create({
      data: {
        jobId: id,
        reporterId: session?.user?.id || null,
        reason: reason.trim(),
        details: details ? details.trim() : null,
      },
    });
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

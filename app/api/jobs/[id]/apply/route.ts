import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "DEVELOPER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    coverLetter?: unknown;
    resumeUrl?: unknown;
  };
  const coverLetter =
    typeof body.coverLetter === "string" && body.coverLetter.trim()
      ? body.coverLetter.trim()
      : null;
  const resumeUrl =
    typeof body.resumeUrl === "string" && body.resumeUrl.trim()
      ? body.resumeUrl.trim()
      : null;

  const job = await db.job.findFirst({
    where: { id, isActive: true },
    select: { id: true },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const existing = await db.application.findUnique({
    where: { jobId_userId: { jobId: id, userId: session.user.id } },
  });
  if (existing)
    return NextResponse.json({ error: "Already applied" }, { status: 409 });

  const application = await db.application.create({
    data: { jobId: job.id, userId: session.user.id, coverLetter, resumeUrl },
  });

  return NextResponse.json(application);
}

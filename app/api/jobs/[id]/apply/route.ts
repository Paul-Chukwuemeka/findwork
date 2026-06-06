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

  const { id } = await params;
  const { coverLetter, resumeUrl } = await req.json();

  const existing = await db.application.findUnique({
    where: { jobId_userId: { jobId: id, userId: session.user.id } },
  });
  if (existing)
    return NextResponse.json({ error: "Already applied" }, { status: 409 });

  const application = await db.application.create({
    data: { jobId: id, userId: session.user.id, coverLetter, resumeUrl },
  });

  return NextResponse.json(application);
}

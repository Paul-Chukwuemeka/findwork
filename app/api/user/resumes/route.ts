import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "DEVELOPER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const resumes = await db.resume.findMany({
    where: { userId: session.user.id },
    select: { id: true, url: true, fileName: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(resumes);
}

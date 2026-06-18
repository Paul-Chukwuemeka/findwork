import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/user/resumes – list all resumes for the current user
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resumes = await db.resume.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(resumes);
}

// PATCH /api/user/resumes – set a resume as primary
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing resume id" }, { status: 400 });

  // Verify ownership
  const resume = await db.resume.findFirst({ where: { id, userId: session.user.id } });
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Clear existing primary, set new one, and update User.resumeUrl atomically
  await db.$transaction([
    db.resume.updateMany({
      where: { userId: session.user.id },
      data: { isPrimary: false },
    }),
    db.resume.update({
      where: { id },
      data: { isPrimary: true },
    }),
    db.user.update({
      where: { id: session.user.id },
      data: { resumeUrl: resume.url },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

// DELETE /api/user/resumes?id=... – delete a resume record
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Verify ownership before deletion
  const resume = await db.resume.findFirst({ where: { id, userId: session.user.id } });
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wasPrimary = resume.isPrimary;

  await db.resume.delete({ where: { id } });

  if (wasPrimary) {
    // Find next most recent resume to set as primary
    const nextResume = await db.resume.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (nextResume) {
      await db.resume.update({
        where: { id: nextResume.id },
        data: { isPrimary: true },
      });
      await db.user.update({
        where: { id: session.user.id },
        data: { resumeUrl: nextResume.url },
      });
    } else {
      await db.user.update({
        where: { id: session.user.id },
        data: { resumeUrl: null },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

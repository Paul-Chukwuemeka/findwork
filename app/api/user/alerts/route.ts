import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/user/alerts – list all alert subscriptions
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const alerts = await db.alertSub.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}

// POST /api/user/alerts – create a new alert subscription
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { keywords, location } = await req.json();

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: "At least one keyword is required" }, { status: 400 });
  }

  const sanitizedKeywords = keywords.map((k: string) => String(k).trim()).filter(Boolean);
  if (sanitizedKeywords.length === 0) {
    return NextResponse.json({ error: "Keywords cannot be blank" }, { status: 400 });
  }

  const alert = await db.alertSub.create({
    data: {
      userId: session.user.id,
      keywords: sanitizedKeywords,
      location: location ? String(location).trim() || null : null,
    },
  });

  return NextResponse.json(alert, { status: 201 });
}

// DELETE /api/user/alerts?id=... – remove an alert subscription
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const alert = await db.alertSub.findFirst({ where: { id, userId: session.user.id } });
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.alertSub.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await db.apiKey.findMany({
    where: { userId: session.user.id },
    select: { id: true, label: true, lastUsed: true, createdAt: true, key: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(keys);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label } = await req.json();
  const key = `db_${randomBytes(32).toString("hex")}`;

  const apiKey = await db.apiKey.create({
    data: { userId: session.user.id, key, label },
  });

  return NextResponse.json(apiKey);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db.apiKey.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
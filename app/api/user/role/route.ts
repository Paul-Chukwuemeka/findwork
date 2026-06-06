import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = await req.json();
  if (!["EMPLOYER", "DEVELOPER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  return NextResponse.json({ ok: true });
}

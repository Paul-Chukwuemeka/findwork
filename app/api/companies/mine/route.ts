import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([]);

  const companies = await db.company.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true },
  });

  return NextResponse.json(companies);
}
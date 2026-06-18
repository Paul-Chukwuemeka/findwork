import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

async function validateApiKey() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const key = authHeader.slice(7);
  return db.apiKey.findUnique({ where: { key } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiKey = await validateApiKey();
  if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await db.job.findUnique({
    where: { id, isActive: true },
    include: { company: true },
  });

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  return NextResponse.json({ data: job });
}
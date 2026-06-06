import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { JobType } from "@prisma/client";

async function validateApiKey(req: Request) {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7);
  const apiKey = await db.apiKey.findUnique({
    where: { key },
    include: { user: true },
  });
  if (!apiKey) return null;

  // update lastUsed
  await db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  });

  return apiKey.user;
}

export async function GET(req: Request) {
  const user = await validateApiKey(req);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Pass your key as: Authorization: Bearer <key>" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type");
  const location = searchParams.get("location");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

  const where = {
    isActive: true,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { tags: { has: q } },
      ],
    }),
    ...(type && { type: type as JobType }),
    ...(location && { location: { contains: location, mode: "insensitive" as const } }),
  };

  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      include: { company: { select: { name: true, slug: true, website: true, location: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.job.count({ where }),
  ]);

  return NextResponse.json({
    data: jobs,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}
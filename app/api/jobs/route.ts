import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companyId, title, description, type, location, salaryRange, tags } = await req.json();

  // verify company ownership
  const company = await db.company.findFirst({
    where: { id: companyId, ownerId: session.user.id },
  });
  if (!company) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const slug = `${slugify(title)}-${nanoid(6)}`;

  const job = await db.job.create({
    data: { companyId, title, slug, description, type, location, salaryRange, tags },
  });

  return NextResponse.json(job);
}
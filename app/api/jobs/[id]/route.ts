import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

import { Prisma } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await db.job.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.company.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, type, location, salaryRange, tags, isActive } = await req.json();

  const data: Prisma.JobUpdateInput = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (type !== undefined) data.type = type;
  if (location !== undefined) data.location = location;
  if (salaryRange !== undefined) data.salaryRange = salaryRange;
  if (tags !== undefined) data.tags = tags;
  if (isActive !== undefined) data.isActive = isActive;

  const updatedJob = await db.job.update({
    where: { id },
    data,
  });

  return NextResponse.json(updatedJob);
}

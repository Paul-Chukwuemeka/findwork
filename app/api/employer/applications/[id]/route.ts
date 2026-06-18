import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ApplicationStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const application = await db.application.findUnique({
    where: { id },
    include: {
      job: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.job.company.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();

  if (!Object.values(ApplicationStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const updatedApplication = await db.application.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updatedApplication);
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const company = await db.company.findUnique({
    where: { id },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  if (company.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, website, location, about, logoUrl } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const updatedCompany = await db.company.update({
    where: { id },
    data: {
      name: name.trim(),
      slug: slugify(name),
      website: website ? website.trim() : null,
      location: location ? location.trim() : null,
      about: about ? about.trim() : null,
      logoUrl: logoUrl ? logoUrl.trim() : null,
    },
  });

  return NextResponse.json(updatedCompany);
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, website, location, about, logoUrl } = await req.json();
  const slug = slugify(name);

  const company = await db.company.create({
    data: {
      ownerId: session.user.id,
      name,
      slug,
      website,
      location,
      about,
      logoUrl,
    },
  });

  return NextResponse.json(company);
}
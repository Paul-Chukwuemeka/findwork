import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        bio: true,
        skills: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Could not fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { githubUrl, linkedinUrl, portfolioUrl, bio, skills } = await req.json();

    // Validate inputs - ensure skills is an array of strings
    let parsedSkills: string[] = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills.map(s => String(s).trim()).filter(Boolean);
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        githubUrl: githubUrl ? String(githubUrl).trim() : null,
        linkedinUrl: linkedinUrl ? String(linkedinUrl).trim() : null,
        portfolioUrl: portfolioUrl ? String(portfolioUrl).trim() : null,
        bio: bio ? String(bio).trim() : null,
        skills: parsedSkills,
      },
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
  }
}

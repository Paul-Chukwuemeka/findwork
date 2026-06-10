import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { checkUserExists } from "@/utils/checkUserExists";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  console.log(email,password,name)

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  // const existing = await checkUserExists(email);
  // console.log(existing)

  // if (existing) {
  //   return NextResponse.json(
  //     { error: "User with this email already exists" },
  //     { status: 400 },
  //   );
  // }

  const hashed = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: { name, email, password: hashed },
  });
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}


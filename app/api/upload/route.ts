import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/r2";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const key = `uploads/${session.user.id}/${nanoid()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const publicUrl = await uploadFile(key, buffer, file.type || "application/octet-stream");

  return NextResponse.json({ key, publicUrl });
}

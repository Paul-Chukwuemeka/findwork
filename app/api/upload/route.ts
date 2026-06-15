import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/r2";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

const VALID_RESUME_TYPES = [".pdf", ".doc", ".docx"];
const VALID_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function isValidResumeFile(fileName: string, mimeType: string): boolean {
  const ext = `.${fileName.split(".").pop()?.toLowerCase() ?? ""}`;
  const isValidExt = VALID_RESUME_TYPES.includes(ext);
  const isValidMime = VALID_MIME_TYPES.includes(mimeType);
  return isValidExt && isValidMime;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const mimeType = file.type || "application/octet-stream";
  
  // Validate resume file type
  if (!isValidResumeFile(file.name, mimeType)) {
    return NextResponse.json(
      { error: "Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx)" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const key = `uploads/${session.user.id}/${nanoid()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const publicUrl = await uploadFile(key, buffer, mimeType);

  // Store resume metadata
  await db.resume.create({
    data: {
      userId: session.user.id,
      url: publicUrl,
      fileName: file.name,
    },
  });

  return NextResponse.json({ key, publicUrl });
}

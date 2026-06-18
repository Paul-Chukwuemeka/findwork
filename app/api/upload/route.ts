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

const VALID_IMAGE_TYPES = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
const VALID_IMAGE_MIMES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

function isValidResumeFile(fileName: string, mimeType: string): boolean {
  const ext = `.${fileName.split(".").pop()?.toLowerCase() ?? ""}`;
  const isValidExt = VALID_RESUME_TYPES.includes(ext);
  const isValidMime = VALID_MIME_TYPES.includes(mimeType);
  return isValidExt && isValidMime;
}

function isValidImageFile(fileName: string, mimeType: string): boolean {
  const ext = `.${fileName.split(".").pop()?.toLowerCase() ?? ""}`;
  const isValidExt = VALID_IMAGE_TYPES.includes(ext);
  const isValidMime = VALID_IMAGE_MIMES.includes(mimeType);
  return isValidExt && isValidMime;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const ext = file.name.split(".").pop() ?? "bin";
    const isImage = mimeType.startsWith("image/") || VALID_IMAGE_TYPES.includes(`.${ext.toLowerCase()}`);

    if (isImage) {
      if (!isValidImageFile(file.name, mimeType)) {
        return NextResponse.json(
          { error: "Invalid image type. Please upload a PNG, JPG, GIF, WebP or SVG image." },
          { status: 400 }
        );
      }
    } else {
      if (!isValidResumeFile(file.name, mimeType)) {
        return NextResponse.json(
          { error: "Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx)" },
          { status: 400 }
        );
      }
    }

    const key = `uploads/${session.user.id}/${nanoid()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadFile(key, buffer, mimeType);

    // Only store resume metadata for non-image uploads
    if (!isImage) {
      const isFirst = (await db.resume.count({ where: { userId: session.user.id } })) === 0;
      await db.resume.create({
        data: {
          userId: session.user.id,
          url: publicUrl,
          fileName: file.name,
          isPrimary: isFirst,
        },
      });
      if (isFirst) {
        await db.user.update({
          where: { id: session.user.id },
          data: { resumeUrl: publicUrl },
        });
      }
    }

    return NextResponse.json({ key, publicUrl });
  } catch (error) {
    console.error("Error during upload:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

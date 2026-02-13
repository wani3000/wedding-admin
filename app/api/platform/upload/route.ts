import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp4",
  ".mov",
  ".webm",
]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "인증 필요" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderRaw = (formData.get("folder") as string | null) || "misc";
    const folder = sanitizeSegment(folderRaw) || "misc";

    if (!file) {
      return NextResponse.json({ message: "파일이 없습니다." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "파일 용량 제한(50MB)을 초과했습니다." },
        { status: 400 },
      );
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "지원하지 않는 MIME 타입입니다." },
        { status: 400 },
      );
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { message: "지원하지 않는 파일 형식입니다." },
        { status: 400 },
      );
    }

    const safeBaseName = sanitizeSegment(path.basename(file.name, ext)) || "upload";
    const fileName = `${Date.now()}-${safeBaseName}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(arrayBuffer));

    return NextResponse.json({
      src: `/uploads/${folder}/${fileName}`,
    });
  } catch {
    return NextResponse.json(
      { message: "업로드 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

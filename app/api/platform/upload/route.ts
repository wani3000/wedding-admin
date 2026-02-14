import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

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

const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "invitation-assets";

async function ensureStorageBucket() {
  const supabase = createServiceClient();
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error("스토리지 버킷 목록 조회 실패");
  }

  const exists = (buckets || []).some((bucket) => bucket.name === STORAGE_BUCKET);
  if (exists) return;

  const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: `${MAX_FILE_SIZE}`,
  });

  if (createError) {
    throw new Error("스토리지 버킷 생성 실패");
  }
}

export async function POST(request: Request) {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

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

    const ext = file.name.includes(".")
      ? `.${file.name.split(".").pop()?.toLowerCase() || ""}`
      : "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { message: "지원하지 않는 파일 형식입니다." },
        { status: 400 },
      );
    }

    const safeBaseName =
      sanitizeSegment(file.name.replace(ext, "").replace(/\.[^.]+$/, "")) || "upload";
    const fileName = `${Date.now()}-${safeBaseName}${ext}`;
    const objectPath = `${user.id}/${folder}/${fileName}`;
    const arrayBuffer = await file.arrayBuffer();

    await ensureStorageBucket();
    const service = createServiceClient();
    const { error: uploadError } = await service.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ message: "스토리지 업로드 실패" }, { status: 500 });
    }

    const { data: publicUrlData } = service.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(objectPath);

    const src = publicUrlData.publicUrl;
    if (!src) {
      return NextResponse.json({ message: "공개 URL 생성 실패" }, { status: 500 });
    }

    return NextResponse.json({
      src,
    });
  } catch {
    return NextResponse.json(
      { message: "업로드 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { getWeddingContent, saveWeddingContent } from "@/lib/content/store";
import type { WeddingContent } from "@/lib/content/types";
import { ContentValidationError } from "@/lib/content/validate";
import { isAdminAuthorized } from "@/lib/content/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request.headers)) {
    return NextResponse.json({ message: "인증 실패" }, { status: 401 });
  }

  const content = await getWeddingContent();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request.headers)) {
    return NextResponse.json({ message: "인증 실패" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as WeddingContent;
    const saved = await saveWeddingContent(body);
    return NextResponse.json(saved);
  } catch (error) {
    if (error instanceof ContentValidationError) {
      return NextResponse.json(
        {
          message: "입력값 검증에 실패했습니다.",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "콘텐츠 저장 중 오류가 발생했습니다." },
      { status: 400 },
    );
  }
}

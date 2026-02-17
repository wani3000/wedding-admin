import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/content/admin-auth";
import { searchKakaoKeywordPlaces } from "@/lib/kakao/local-search";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminAuthorized(new Headers(request.headers))) {
    return NextResponse.json({ message: "관리자 인증 실패" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ places: [] });
  }

  try {
    const places = await searchKakaoKeywordPlaces(q);
    return NextResponse.json({ places });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "장소 검색에 실패했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

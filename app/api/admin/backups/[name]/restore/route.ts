import { NextResponse } from "next/server";
import { ContentValidationError } from "@/lib/content/validate";
import { restoreContentBackup } from "@/lib/content/store";
import { isAdminAuthorized } from "@/lib/content/admin-auth";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: { name: string } },
) {
  if (!isAdminAuthorized(request.headers)) {
    return NextResponse.json({ message: "인증 실패" }, { status: 401 });
  }

  try {
    const restored = await restoreContentBackup(context.params.name);
    return NextResponse.json(restored);
  } catch (error) {
    if (error instanceof ContentValidationError) {
      return NextResponse.json(
        { message: "백업 복원 검증 실패", errors: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "백업 복원 중 오류가 발생했습니다." },
      { status: 400 },
    );
  }
}

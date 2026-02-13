import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/content/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type Action = "expire" | "restore";

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  if (!isAdminAuthorized(new Headers(request.headers))) {
    return NextResponse.json({ message: "관리자 인증 실패" }, { status: 401 });
  }

  const body = (await request.json()) as { action?: Action };
  const action = body.action;
  if (action !== "expire" && action !== "restore") {
    return NextResponse.json({ message: "잘못된 요청" }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const patch =
      action === "expire"
        ? { status: "archived", published_at: null }
        : { status: "published", published_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from("invitations")
      .update(patch)
      .eq("id", context.params.id)
      .select("id,status,published_at")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ message: "상태 변경 실패" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "서버 설정 오류" }, { status: 500 });
  }
}


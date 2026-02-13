import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "인증 필요" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: "expire" | "restore";
  };

  if (body.action !== "expire" && body.action !== "restore") {
    return NextResponse.json({ message: "action 값이 필요합니다." }, { status: 400 });
  }

  const patch =
    body.action === "expire"
      ? { status: "archived", published_at: null }
      : { status: "published", published_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from("invitations")
    .update(patch)
    .eq("id", context.params.id)
    .eq("user_id", user.id)
    .select("id,status,published_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: "상태 변경 실패" }, { status: 500 });
  }

  return NextResponse.json(data);
}

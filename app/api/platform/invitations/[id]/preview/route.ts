import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
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

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("id", context.params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

  const { data: preview, error } = await supabase
    .from("preview_tokens")
    .insert({
      invitation_id: context.params.id,
      user_id: user.id,
      expires_at: expiresAt,
    })
    .select("token")
    .single();

  if (error || !preview) {
    return NextResponse.json({ message: "미리보기 링크 생성 실패" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  return NextResponse.json({
    token: preview.token,
    previewUrl: `${baseUrl}/preview/${preview.token}`,
    expiresAt,
  });
}

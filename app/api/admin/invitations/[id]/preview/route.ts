import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/content/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: { id: string } },
) {
  if (!isAdminAuthorized(new Headers(request.headers))) {
    return NextResponse.json({ message: "관리자 인증 실패" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id,user_id")
    .eq("id", context.params.id)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json({ message: "초대장 없음" }, { status: 404 });
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

  const { data: preview, error } = await supabase
    .from("preview_tokens")
    .insert({
      invitation_id: context.params.id,
      user_id: invitation.user_id,
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


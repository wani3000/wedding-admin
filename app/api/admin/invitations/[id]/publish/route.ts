import { NextResponse } from "next/server";
import { createBlankWeddingContent } from "@/lib/content/blank";
import { normalizeWeddingContent } from "@/lib/content/validate";
import { ensureInvitationPublicId } from "@/lib/platform/invitations";
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
    .select("id,user_id,public_id")
    .eq("id", context.params.id)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json({ message: "초대장 없음" }, { status: 404 });
  }

  let publicId: string;
  try {
    publicId = await ensureInvitationPublicId(
      supabase,
      invitation.id,
      invitation.user_id,
      invitation.public_id,
    );
  } catch {
    return NextResponse.json({ message: "공개 링크 ID 생성 실패" }, { status: 500 });
  }

  const { data: latestDraft } = await supabase
    .from("invitation_contents")
    .select("content_json")
    .eq("invitation_id", context.params.id)
    .eq("is_published_snapshot", false)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestDraft) {
    return NextResponse.json({ message: "내보낼 초안이 없습니다." }, { status: 400 });
  }

  const { data: latestPublished } = await supabase
    .from("invitation_contents")
    .select("version")
    .eq("invitation_id", context.params.id)
    .eq("is_published_snapshot", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPublishedVersion = (latestPublished?.version || 0) + 1;

  const normalized = normalizeWeddingContent(
    latestDraft.content_json,
    createBlankWeddingContent(),
  );

  const { error: snapshotError } = await supabase.from("invitation_contents").insert({
    invitation_id: context.params.id,
    content_json: normalized,
    version: nextPublishedVersion,
    is_published_snapshot: true,
  });

  if (snapshotError) {
    return NextResponse.json({ message: "내보내기 스냅샷 저장 실패" }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("invitations")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", context.params.id);

  if (updateError) {
    return NextResponse.json({ message: "공개 링크 갱신 실패" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_INVITATION_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  return NextResponse.json({
    publicId,
    url: `${baseUrl}/invitation/${publicId}`,
  });
}


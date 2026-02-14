import { NextResponse } from "next/server";
import { createBlankWeddingContent } from "@/lib/content/blank";
import { normalizeWeddingContent } from "@/lib/content/validate";
import { createClient } from "@/lib/supabase/server";
import { ensureInvitationPublicId } from "@/lib/platform/invitations";

export const runtime = "nodejs";

function resolveInvitationTitle(content: Record<string, unknown>): string {
  const share = typeof content.share === "object" && content.share !== null
    ? (content.share as Record<string, unknown>)
    : {};
  const couple = typeof content.couple === "object" && content.couple !== null
    ? (content.couple as Record<string, unknown>)
    : {};

  const kakaoTitle = typeof share.kakaoTitle === "string" ? share.kakaoTitle.trim() : "";
  if (kakaoTitle !== "") return kakaoTitle;

  const displayName = typeof couple.displayName === "string" ? couple.displayName.trim() : "";
  if (displayName !== "") return displayName;

  const groomName = typeof couple.groomName === "string" ? couple.groomName.trim() : "";
  const brideName = typeof couple.brideName === "string" ? couple.brideName.trim() : "";
  return `${groomName} ${brideName}`.trim();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "인증 필요" }, { status: 401 });
  }

  const body = await request.json();
  const normalized = normalizeWeddingContent(body, createBlankWeddingContent());
  const title = resolveInvitationTitle(normalized as unknown as Record<string, unknown>);

  const { data: created, error: createError } = await supabase
    .from("invitations")
    .insert({
      user_id: user.id,
      title,
      status: "draft",
    })
    .select("id, public_id")
    .single();

  if (createError || !created) {
    return NextResponse.json({ message: "초대장 생성 실패" }, { status: 500 });
  }

  let publicId = "";
  try {
    publicId = await ensureInvitationPublicId(supabase, created.id, user.id, created.public_id);
  } catch {
    return NextResponse.json({ message: "공개 링크 ID 생성 실패" }, { status: 500 });
  }

  const { error: draftInsertError } = await supabase.from("invitation_contents").insert({
    invitation_id: created.id,
    content_json: normalized,
    version: 1,
    is_published_snapshot: false,
  });

  if (draftInsertError) {
    return NextResponse.json({ message: "초안 저장 실패" }, { status: 500 });
  }

  const { error: snapshotError } = await supabase.from("invitation_contents").insert({
    invitation_id: created.id,
    content_json: normalized,
    version: 1,
    is_published_snapshot: true,
  });

  if (snapshotError) {
    return NextResponse.json({ message: "내보내기 스냅샷 저장 실패" }, { status: 500 });
  }

  const { error: publishError } = await supabase
    .from("invitations")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      title,
    })
    .eq("id", created.id)
    .eq("user_id", user.id);

  if (publishError) {
    return NextResponse.json({ message: "공개 링크 갱신 실패" }, { status: 500 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_INVITATION_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    new URL(request.url).origin;

  return NextResponse.json({
    invitationId: created.id,
    publicId,
    url: `${baseUrl}/invitation/${publicId}`,
  });
}

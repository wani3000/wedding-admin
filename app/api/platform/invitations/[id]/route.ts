import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "인증 필요" }, { status: 401 });
  }

  const { data: invitation, error: invitationError } = await supabase
    .from("invitations")
    .select("id,user_id,status")
    .eq("id", context.params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (invitationError || !invitation) {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }

  if (invitation.status !== "draft") {
    return NextResponse.json({ message: "제작중인 초대장만 삭제할 수 있습니다." }, { status: 400 });
  }

  const { error: contentDeleteError } = await supabase
    .from("invitation_contents")
    .delete()
    .eq("invitation_id", context.params.id);

  if (contentDeleteError) {
    return NextResponse.json({ message: "초대장 콘텐츠 삭제 실패" }, { status: 500 });
  }

  const { error: invitationDeleteError } = await supabase
    .from("invitations")
    .delete()
    .eq("id", context.params.id)
    .eq("user_id", user.id);

  if (invitationDeleteError) {
    return NextResponse.json({ message: "초대장 삭제 실패" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

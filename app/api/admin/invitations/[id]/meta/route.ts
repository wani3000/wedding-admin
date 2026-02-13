import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/content/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: { id: string } },
) {
  if (!isAdminAuthorized(new Headers(request.headers))) {
    return NextResponse.json({ message: "관리자 인증 실패" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("id,public_id,status,published_at")
    .eq("id", context.params.id)
    .maybeSingle();

  if (error || !invitation) {
    return NextResponse.json({ message: "초대장 조회 실패" }, { status: 404 });
  }

  return NextResponse.json(invitation);
}


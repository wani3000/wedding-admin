import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
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

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("id,public_id,status,published_at")
    .eq("id", context.params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !invitation) {
    return NextResponse.json({ message: "권한 없음" }, { status: 403 });
  }

  return NextResponse.json(invitation);
}

import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/content/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminAuthorized(new Headers(request.headers))) {
    return NextResponse.json({ message: "관리자 인증 실패" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("invitations")
      .select("id,user_id,title,public_id,status,published_at,created_at,updated_at,users(name,email)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: "초대장 목록 조회 실패" }, { status: 500 });
    }

    return NextResponse.json({ invitations: data || [] });
  } catch {
    return NextResponse.json({ message: "서버 설정 오류" }, { status: 500 });
  }
}


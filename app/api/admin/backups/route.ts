import { NextResponse } from "next/server";
import { listContentBackups } from "@/lib/content/store";
import { isAdminAuthorized } from "@/lib/content/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request.headers)) {
    return NextResponse.json({ message: "인증 실패" }, { status: 401 });
  }

  const backups = await listContentBackups();
  return NextResponse.json({ backups });
}

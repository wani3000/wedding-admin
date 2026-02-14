import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mc } from "@/lib/mariecardStyles";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
        <p className="mt-2 text-sm text-gray-600">임시 페이지입니다. 추후 프로필/결제/요금 정보를 추가할 수 있습니다.</p>

        <div className="mt-6 space-y-2 rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
          <p>이름: {user.user_metadata?.name || "-"}</p>
          <p>이메일: {user.email || "-"}</p>
          <p>회원 ID: {user.id}</p>
        </div>

        <Link
          href="/dashboard"
          className={`mt-6 inline-flex ${mc.secondaryButton}`}
        >
          대시보드로 돌아가기
        </Link>
      </div>
    </main>
  );
}

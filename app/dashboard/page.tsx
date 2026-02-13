import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureInvitationPublicId } from "@/lib/platform/invitations";

async function ensureUserProfile(user: {
  id: string;
  email?: string | null;
  user_metadata?: { name?: string };
}) {
  const supabase = await createClient();
  await supabase.from("users").upsert({
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || "",
    provider: "google",
  });
}

async function ensureInvitation(userId: string) {
  const supabase = await createClient();

  const { data: existing, error } = await supabase
    .from("invitations")
    .select("id, public_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (existing) {
    const publicId = await ensureInvitationPublicId(
      supabase,
      existing.id,
      userId,
      existing.public_id,
    );
    return { ...existing, public_id: publicId };
  }

  const { data: created, error: insertError } = await supabase
    .from("invitations")
    .insert({
      user_id: userId,
      title: "",
      status: "draft",
    })
    .select("id, public_id")
    .single();

  if (insertError) throw insertError;
  const publicId = await ensureInvitationPublicId(
    supabase,
    created.id,
    userId,
    created.public_id,
  );
  return { ...created, public_id: publicId };
}

export default async function DashboardPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/setup/status");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  await ensureUserProfile({
    id: user.id,
    email: user.email,
    user_metadata: { name: user.user_metadata?.name },
  });

  let invitation;
  try {
    invitation = await ensureInvitation(user.id);
  } catch {
    redirect("/setup/status");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-sm text-gray-600">로그인 완료. 청첩장 관리로 이동할 수 있습니다.</p>

        <div className="mt-6 space-y-2 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-700">내 청첩장 ID: {invitation.id}</p>
          <p className="text-sm text-gray-700">공개 ID(publicId): {invitation.public_id ?? "미발급"}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/dashboard/invitation/${invitation.id}/admin`}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            청첩장 관리자 열기
          </Link>
          {invitation.public_id && (
            <Link
              href={`/invitation/${invitation.public_id}`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              공개 링크 확인
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

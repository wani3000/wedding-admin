"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function LandingStart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (authError) {
        setError("Google 로그인 시작에 실패했습니다.");
      }
    } catch {
      setError("로그인 설정을 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">청첩장 제작하기</h1>
        <Link
          href="/sample"
          className="mt-6 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
        >
          청첩장 샘플 미리보기
        </Link>
        <button
          onClick={handleStart}
          disabled={loading}
          className="mt-3 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "이동 중..." : "로그인하고 제작하기"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}

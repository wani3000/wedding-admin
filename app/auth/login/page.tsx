"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      // IMPORTANT: redirectTo must match Supabase Redirect URLs allowlist exactly.
      // Avoid appending query params here (e.g. ?next=...) because some allowlists treat it as a mismatch
      // and fall back to Site URL (often production).
      const authBaseUrl = window.location.origin;
      const redirectTo = `${authBaseUrl}/auth/callback`;

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (data?.url) {
        // Preserve requested next path locally; callback route will default to /dashboard if not present.
        try {
          window.sessionStorage.setItem("mariecard_post_auth_next", nextPath);
        } catch {
          // ignore
        }
        // Make the redirect explicit so we can trust the generated URL.
        window.location.assign(data.url);
        return;
      }

      if (authError) {
        setError("Google 로그인 시작에 실패했습니다.");
      }
    } catch {
      setError("Supabase 환경변수를 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">MarieCard 로그인</h1>
        <p className="mt-2 text-sm text-gray-600">
          Google 계정으로 로그인하면 청첩장 관리자에 진입합니다.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "이동 중..." : "Google로 로그인"}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50 px-4 py-12" />}>
      <LoginPageContent />
    </Suspense>
  );
}

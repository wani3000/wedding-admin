const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

export default function SetupStatusPage() {
  const checks = REQUIRED_ENV.map((key) => ({
    key,
    ok: Boolean(process.env[key]),
  }));

  const allOk = checks.every((item) => item.ok);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">플랫폼 설정 상태</h1>
        <p className="mt-2 text-sm text-gray-600">
          Supabase/인증 연동에 필요한 환경변수 및 실행 상태를 확인합니다.
        </p>

        <div className="mt-6 space-y-2">
          {checks.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <span className="font-mono text-sm text-gray-700">{item.key}</span>
              <span
                className={`text-sm font-medium ${item.ok ? "text-green-600" : "text-red-600"}`}
              >
                {item.ok ? "OK" : "MISSING"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p>SQL 적용 파일:</p>
          <p className="mt-1 font-mono">db/migrations/001_platform_init.sql</p>
          <p className="mt-3">Google OAuth Redirect URL:</p>
          <p className="mt-1 font-mono">{process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/auth/callback</p>
        </div>

        <p className={`mt-6 text-sm font-semibold ${allOk ? "text-green-700" : "text-orange-700"}`}>
          {allOk ? "환경변수 준비 완료" : "환경변수 일부 누락 - .env.local 확인 필요"}
        </p>
      </div>
    </main>
  );
}

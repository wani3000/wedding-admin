import Link from "next/link";
import type { Metadata } from "next";
import { InvitationRenderer } from "@/components/pages/InvitationRenderer";
import { getPreviewInvitationContent } from "@/lib/platform/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PreviewPage({
  params,
}: {
  params: { token: string };
}) {
  const result = await getPreviewInvitationContent(params.token);

  if (!result.content) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900">미리보기를 열 수 없습니다</h1>
          <p className="mt-3 text-sm text-gray-600">
            {result.reason === "unauthorized" && "로그인이 필요합니다."}
            {result.reason === "forbidden" && "본인 미리보기 링크만 확인할 수 있습니다."}
            {result.reason === "expired" && "미리보기 링크가 만료되었습니다."}
            {result.reason === "not_found" && "유효하지 않은 링크입니다."}
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            대시보드로 이동
          </Link>
        </div>
      </main>
    );
  }

  return (
    <InvitationRenderer
      content={result.content}
      routeBasePath={`/preview/${params.token}`}
    />
  );
}

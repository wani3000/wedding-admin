import Link from "next/link";
import { GalleryPageClient } from "@/components/pages/GalleryPageClient";
import { getPreviewInvitationContent } from "@/lib/platform/content";

export const dynamic = "force-dynamic";

export default async function PreviewGalleryPage({
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
          <p className="mt-3 text-sm text-gray-600">다시 미리보기 링크를 생성해 주세요.</p>
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
    <GalleryPageClient
      images={result.content.gallerySection.images}
      backHref={`/preview/${params.token}#gallery`}
      lightboxPath={`/preview/${params.token}/lightbox`}
    />
  );
}

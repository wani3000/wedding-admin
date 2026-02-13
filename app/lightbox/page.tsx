import { LightboxPageClient } from "@/components/pages/LightboxPageClient";
import { getWeddingContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function LightboxPage() {
  const content = await getWeddingContent();
  return <LightboxPageClient images={content.gallerySection.images} />;
}

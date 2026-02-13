import { LightboxPageClient } from "@/components/pages/LightboxPageClient";
import { defaultWeddingContent } from "@/lib/content/defaults";

export default function SampleLightboxPage() {
  return (
    <LightboxPageClient
      images={defaultWeddingContent.gallerySection.images}
      lightboxPath="/sample/lightbox"
    />
  );
}

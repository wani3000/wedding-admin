import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Gallery } from "@/components/sections/Gallery";
import { Details } from "@/components/sections/Details";
import { Account } from "@/components/sections/Account";
import { Footer } from "@/components/sections/Footer";
import { ShareButtons } from "@/components/sections/ShareButtons";
import { VideoHero } from "@/components/sections/VideoHero";
import { getWeddingContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getWeddingContent();

  return (
    <main className="relative min-h-screen text-primary">
      <Header content={content} />
      <VideoHero heroMedia={content.heroMedia} />

      <div className="relative z-10 bg-white">
        <Hero title={content.heroSection.title} images={content.heroSection.images} />
        <Intro content={content.introSection} />
        <Gallery content={content.gallerySection} />
        <Details content={content.detailsSection} />
        <Account content={content.accountSection} />
        <Footer content={content} />
      </div>

      <ShareButtons content={content} />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { GalleryImageItem } from "@/lib/content/types";

const SCROLL_RESTORE_DELAY = 100;

export function GalleryPageClient({
  images,
  backHref = "/#gallery",
  lightboxPath = "/lightbox",
}: {
  images: GalleryImageItem[];
  backHref?: string;
  lightboxPath?: string;
}) {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const handleBack = () => {
    router.push(backHref);
    setTimeout(() => {
      const savedPosition = sessionStorage.getItem("mainScrollPosition");
      if (savedPosition) {
        window.scrollTo({
          top: parseInt(savedPosition, 10),
          behavior: "instant",
        });
      }
    }, SCROLL_RESTORE_DELAY);
  };

  return (
    <div className="min-h-screen bg-white">
      {isDesktop && (
        <header className="fixed top-0 z-50 w-full bg-white shadow-sm pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex w-full max-w-[1400px] items-center px-6 py-6 md:px-10">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm font-medium text-black transition-colors hover:text-gray-600"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
              뒤로가기
            </button>
          </div>
        </header>
      )}

      <main className={`px-4 pb-24 ${isDesktop ? "pt-24" : "pt-8"}`}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] items-start">
            {images.map((image, i) => (
              <div key={`${image.src}-${i}`}>
                <Link href={`${lightboxPath}?index=${i}`}>
                  <div className="group cursor-pointer">
                    <div
                      className={`relative w-full overflow-hidden bg-gray-200 ${image.aspect || "aspect-[2/3]"}`}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <Image
                        src={image.src}
                        alt={image.title}
                        fill
                        loading="lazy"
                        className="object-cover select-none transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        draggable={false}
                      />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      {!isDesktop && (
        <div className="fixed bottom-[50px] left-0 right-0 z-50">
          <div className="mx-auto flex max-w-lg items-center justify-center px-[26px]">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
              뒤로가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

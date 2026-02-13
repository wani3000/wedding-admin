"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { GalleryImageItem } from "@/lib/content/types";

function LightboxContent({
  images,
  lightboxPath,
}: {
  images: GalleryImageItem[];
  lightboxPath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIndex = parseInt(searchParams.get("index") || "0");

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const totalImages = images.length;

  useEffect(() => {
    const bounded = Math.max(0, Math.min(initialIndex, totalImages - 1));
    setCurrentIndex(bounded);
  }, [initialIndex, totalImages]);

  useEffect(() => {
    router.replace(`${lightboxPath}?index=${currentIndex}`, { scroll: false });
  }, [currentIndex, lightboxPath, router]);

  useEffect(() => {
    const checkGradients = () => {
      const container = thumbnailScrollRef.current;
      if (!container) return;

      const thumbnailWidth =
        container.children.length > 0
          ? (container.children[0] as HTMLElement).offsetWidth
          : 0;
      const gap = 6;
      const totalThumbnailsWidth = (thumbnailWidth + gap) * totalImages - gap;
      const containerWidth = container.clientWidth;

      const hasOverflow = totalThumbnailsWidth > containerWidth;

      if (!hasOverflow) {
        setShowLeftGradient(false);
        setShowRightGradient(false);
        return;
      }

      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftGradient(scrollLeft > 10);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);
    };

    setTimeout(checkGradients, 100);

    const container = thumbnailScrollRef.current;
    if (container) {
      container.addEventListener("scroll", checkGradients);
      window.addEventListener("resize", checkGradients);

      return () => {
        container.removeEventListener("scroll", checkGradients);
        window.removeEventListener("resize", checkGradients);
      };
    }
  }, [currentIndex, totalImages]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalImages);
    scrollToThumbnail((currentIndex + 1) % totalImages);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
    scrollToThumbnail((currentIndex - 1 + totalImages) % totalImages);
  };

  const scrollToThumbnail = (index: number) => {
    if (thumbnailScrollRef.current) {
      const thumbnail = thumbnailScrollRef.current.children[index] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  if (totalImages === 0) {
    return <div className="fixed inset-0 bg-white" />;
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-white"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="flex justify-end px-5"
        style={{ paddingTop: "20px", paddingBottom: "8px", flexShrink: 0 }}
      >
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div
        className="relative flex justify-center overflow-hidden px-5"
        style={{
          height: "calc(100vh - 132px)",
          flexShrink: 0,
        }}
      >
        <div
          className="relative w-full h-full max-w-2xl"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              fill
              className="object-contain select-none"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
              draggable={false}
            />
          </motion.div>
        </div>

        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-transform hover:scale-110 active:scale-95 md:left-8 hidden md:block z-30"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-transform hover:scale-110 active:scale-95 md:right-8 hidden md:block z-30"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div
          className="absolute inset-y-0 left-0 w-1/6 z-20 md:hidden"
          onClick={prevImage}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/6 z-20 md:hidden"
          onClick={nextImage}
        />
      </div>

      <div
        className="relative z-40"
        style={{
          paddingTop: "4px",
          paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
          flexShrink: 0,
          height: "calc(64px + env(safe-area-inset-bottom))",
        }}
      >
        {showLeftGradient && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity duration-300" />
        )}

        {showRightGradient && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-300" />
        )}

        <div
          ref={thumbnailScrollRef}
          className="flex h-full w-full items-center justify-center gap-1.5 overflow-hidden px-4"
        >
          {images.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              onClick={() => {
                setCurrentIndex(i);
                scrollToThumbnail(i);
              }}
              onContextMenu={(e) => e.preventDefault()}
              className="relative h-full aspect-[2/3] md:aspect-square flex-shrink-0 overflow-hidden rounded-sm transition-all duration-300"
              style={{
                opacity: 1,
                transform: i === currentIndex ? "scale(1.2)" : "scale(0.95)",
                scrollSnapAlign: "center",
              }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover select-none"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LightboxPageClient({
  images,
  lightboxPath = "/lightbox",
}: {
  images: GalleryImageItem[];
  lightboxPath?: string;
}) {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-white" />}>
      <LightboxContent images={images} lightboxPath={lightboxPath} />
    </Suspense>
  );
}

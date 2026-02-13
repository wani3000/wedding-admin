"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ScrollReveal } from "../ui/ScrollReveal";
import type { WeddingContent } from "@/lib/content/types";

export function Gallery({
  content,
  routeBasePath = "",
}: {
  content: WeddingContent["gallerySection"];
  routeBasePath?: string;
}) {
  const projects = content.images.slice(0, 6);
  const galleryHref = routeBasePath ? `${routeBasePath}/gallery` : "/gallery";
  const lightboxHref = (index: number) =>
    routeBasePath
      ? `${routeBasePath}/lightbox?index=${index}`
      : `/lightbox?index=${index}`;

  const handleGalleryClick = () => {
    sessionStorage.setItem("mainScrollPosition", window.scrollY.toString());
  };

  return (
    <section
      id="gallery"
      className="px-4 pt-12 pb-20 md:px-8 md:pt-16 md:pb-28 lg:px-10 lg:pb-32"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal width="100%">
          <Link
            href={galleryHref}
            className="block mb-[38px] md:mb-[56px] lg:mb-[70px]"
            onClick={handleGalleryClick}
          >
            <div className="flex items-center justify-between cursor-pointer group">
              <h2 className="font-serif text-[28px] font-medium leading-[1.33] tracking-tight md:text-[38px] lg:text-[46px] transition-colors group-hover:text-gray-700">
                {content.title}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-semibold text-gray-600">
                  {content.moreLabel}
                </span>
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-[2px] md:gap-1 items-start">
          {projects.map((project, i) => (
            <GalleryItem
              key={`${project.src}-${i}`}
              project={project}
              index={i}
              onGalleryClick={handleGalleryClick}
              href={lightboxHref(i)}
            />
          ))}
        </div>

        <div className="mt-8 md:mt-10 flex justify-center">
          <Link href={galleryHref} onClick={handleGalleryClick}>
            <button className="flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800">
              {content.moreLabel}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function GalleryItem({
  project,
  index,
  onGalleryClick,
  href,
}: {
  project: WeddingContent["gallerySection"]["images"][number];
  index: number;
  onGalleryClick: () => void;
  href: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div>
      <ScrollReveal delay={index * 0.1} width="100%">
        <Link href={href} onClick={onGalleryClick}>
          <div className="group cursor-pointer">
            <div
              className={`relative w-full overflow-hidden bg-gray-200 md:rounded-sm ${project.aspect || "aspect-[2/3]"}`}
              onContextMenu={(e) => e.preventDefault()}
            >
              {!loaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" />
              )}
              {!error && (
                <Image
                  src={project.src}
                  alt={project.title}
                  fill
                  className={`object-cover select-none transition-all duration-500 md:group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  draggable={false}
                  onLoad={() => setLoaded(true)}
                  onError={() => setError(true)}
                />
              )}
            </div>
          </div>
        </Link>
      </ScrollReveal>
    </div>
  );
}

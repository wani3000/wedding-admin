"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Script from "next/script";
import { ScrollReveal } from "../ui/ScrollReveal";
import type { WeddingContent } from "@/lib/content/types";

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: Record<string, unknown>) => void;
      };
    };
  }
}

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "";

function MapModal({
  onClose,
  mapLinks,
}: {
  onClose: () => void;
  mapLinks: WeddingContent["detailsSection"]["mapLinks"];
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white px-4 pb-8 pt-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">지도 보기</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {mapLinks.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.icon}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-base font-medium text-gray-800">
                  {item.name} 지도 보기
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

export function Header({ content }: { content: WeddingContent }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    if (window.Kakao && KAKAO_APP_KEY && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_APP_KEY);
    }

    const handleScroll = () => {
      const heroHeight = window.innerHeight - 80;
      setIsScrolled(window.scrollY > heroHeight);
    };

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkDesktop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkDesktop);
    };
  }, []);

  const handleKakaoLoad = () => {
    if (window.Kakao && KAKAO_APP_KEY && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_APP_KEY);
    }
  };

  const shareKakao = () => {
    if (!KAKAO_APP_KEY || !window.Kakao || !window.Kakao.isInitialized()) {
      alert("카카오 SDK가 초기화되지 않았습니다.");
      return;
    }

    const shareUrl = window.location.href;
    const rawImage =
      content.share.kakaoImageUrl ||
      content.share.ogImageUrl ||
      (content.heroMedia.type === "video"
        ? content.heroMedia.poster || content.heroMedia.mobileSrc || content.share.imageUrl
        : content.heroMedia.mobileSrc || content.share.imageUrl);
    const imageUrl = rawImage.startsWith("http") ? rawImage : `${window.location.origin}${rawImage}`;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: content.share.kakaoTitle,
        description: content.share.kakaoDescription,
        imageUrl,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: content.share.buttonTitle,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  };

  return (
    <>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.7/kakao.min.js"
        strategy="afterInteractive"
        onLoad={handleKakaoLoad}
      />

      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 pt-[env(safe-area-inset-top)] ${
          isScrolled
            ? "bg-white backdrop-blur-sm text-primary shadow-sm"
            : "bg-transparent text-white"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center px-4 py-4 md:px-10 md:py-6">
          <div className="flex w-full items-center justify-between">
            <ScrollReveal>
              <a
                href="/"
                className="max-w-[45vw] truncate text-xs font-medium tracking-tight text-inherit sm:text-sm"
              >
                {content.couple.displayName}
              </a>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="max-w-[50vw] truncate text-right text-xs font-medium tracking-tight text-inherit sm:text-sm">
                {content.wedding.headerLabel}
              </div>
            </ScrollReveal>

            {isDesktop && (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setMapOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
                >
                  지도보기
                </button>

                <button
                  onClick={shareKakao}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 256 256"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M128 36C70.562 36 24 72.713 24 118.244c0 29.308 19.149 55.076 48.024 69.647l-10.27 37.994c-.907 3.358 2.903 6.07 5.834 4.153l44.36-30.072c5.253.744 10.633 1.134 16.052 1.134 57.438 0 104-36.713 104-82.856C232 72.713 185.438 36 128 36z"
                      fill="#191919"
                    />
                  </svg>
                  카카오톡 공유하기
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {mapOpen && (
        <MapModal
          onClose={() => setMapOpen(false)}
          mapLinks={content.detailsSection.mapLinks}
        />
      )}
    </>
  );
}

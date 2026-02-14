"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Script from "next/script";
import Image from "next/image";
import { X } from "lucide-react";
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

const KAKAO_APP_KEY =
  process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "f179ab3e04a4fb5bb2c3e34b89b8662c";

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

export function ShareButtons({ content }: { content: WeddingContent }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_APP_KEY);
    }

    const handleScroll = () => {
      const heroHeight = window.innerHeight - 80;
      setVisible(window.scrollY > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleKakaoLoad = () => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_APP_KEY);
    }
  };

  const shareKakao = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert("카카오 SDK가 초기화되지 않았습니다.");
      return;
    }

    const shareUrl = window.location.href;
    const rawImage =
      content.heroMedia.type === "video"
        ? content.heroMedia.poster || content.heroMedia.mobileSrc || content.share.imageUrl
        : content.heroMedia.mobileSrc || content.share.imageUrl;
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
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        strategy="afterInteractive"
        onLoad={handleKakaoLoad}
      />

      <div
        className={`md:hidden pointer-events-none fixed bottom-[50px] left-0 right-0 z-50 transition-all duration-500 ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="pointer-events-auto mx-auto flex max-w-lg items-center justify-between px-[26px]">
          <button
            onClick={() => setMapOpen(true)}
            className="flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            지도보기
          </button>

          <button
            onClick={shareKakao}
            className="flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 256 256"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M128 36C70.562 36 24 72.713 24 118.244c0 29.308 19.149 55.076 48.024 69.647l-10.27 37.994c-.907 3.358 2.903 6.07 5.834 4.153l44.36-30.072c5.253.744 10.633 1.134 16.052 1.134 57.438 0 104-36.713 104-82.856C232 72.713 185.438 36 128 36z"
                fill="#FEE500"
              />
            </svg>
            카카오톡 공유하기
          </button>
        </div>
      </div>

      {mapOpen && (
        <MapModal
          onClose={() => setMapOpen(false)}
          mapLinks={content.detailsSection.mapLinks}
        />
      )}
    </>
  );
}

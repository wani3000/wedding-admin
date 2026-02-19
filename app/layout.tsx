import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { ImageProtection } from "@/components/ImageProtection";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mariecard.com";
const TITLE = "MarieCard | 초대장 제작하기";
const DESCRIPTION = "Google 로그인 후 청첩장, 돌잔치, 환갑 등 다양한 모바일 초대장을 제작하세요.";
const KEYWORDS = [
  "MarieCard",
  "마리에카드",
  "모바일 초대장",
  "초대장 제작",
  "돌잔치 초대장",
  "환갑 초대장",
  "모바일 초대장",
  "wedding invitation",
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    applicationName: "MarieCard",
    keywords: KEYWORDS,
    alternates: {
      canonical: SITE_URL,
    },
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: SITE_URL,
      siteName: "MarieCard",
      images: [{ url: "/img/1200x630.png", width: 1200, height: 630, alt: "MarieCard" }],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: ["/img/1200x630.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "MarieCard",
              alternateName: "마리에카드",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/qna`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={clsx(
          inter.className,
          "antialiased bg-white text-primary font-sans",
        )}
      >
        <ImageProtection />
        {children}
      </body>
    </html>
  );
}

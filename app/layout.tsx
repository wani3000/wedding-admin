import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { ImageProtection } from "@/components/ImageProtection";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mariecard.com";
const TITLE = "MarieCard | 청첩장 제작하기";
const DESCRIPTION = "Google 로그인 후 나만의 모바일 청첩장을 제작하세요.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: SITE_URL,
      siteName: "MarieCard",
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
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

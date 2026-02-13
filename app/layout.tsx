import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { ImageProtection } from "@/components/ImageProtection";
import { getWeddingContent } from "@/lib/content/store";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.invite-chulwan-nara.com";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getWeddingContent();
  const title = content.share.kakaoTitle;
  const description = content.share.kakaoDescription;
  const ogImage = content.share.imageUrl.startsWith("http")
    ? content.share.imageUrl
    : `${SITE_URL}${content.share.imageUrl}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: title,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    other: {
      "og:image:width": "1200",
      "og:image:height": "630",
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

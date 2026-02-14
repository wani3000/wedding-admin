/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  try {
    return new URL(raw).hostname;
  } catch {
    return "";
  }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https",
              hostname: supabaseHost,
            },
          ]
        : []),
    ],
  },
  // 모바일 테스트를 위해 모든 호스트 허용
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

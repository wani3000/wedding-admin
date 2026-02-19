import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MarieCard | 마리에카드",
    short_name: "마리에카드",
    description: "청첩장, 돌잔치, 환갑 등 다양한 모바일 초대장 제작/관리 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#faf3ec",
    theme_color: "#800532",
    lang: "ko",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

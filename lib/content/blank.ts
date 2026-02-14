import type { WeddingContent } from "@/lib/content/types";

const PLACEHOLDER = "/img/placeholder-gray.svg";

export function createBlankWeddingContent(): WeddingContent {
  const heroImages = Array.from({ length: 3 }, (_, index) => ({
    src: PLACEHOLDER,
    alt: `section-image-${index + 1}`,
  }));

  const galleryImages = Array.from({ length: 12 }, (_, index) => ({
    src: PLACEHOLDER,
    alt: `gallery-image-${index + 1}`,
    title: "",
    aspect: "aspect-[2/3]",
  }));

  return {
    couple: {
      groomName: "홍길동 • 홍길동의 아들 민준",
      brideName: "홍길동 • 홍길동의 딸 서연",
      displayName: "민준 & 서연",
    },
    wedding: {
      dateLabel: "2026년 2월 14일 토요일 오후 5시",
      headerLabel: "26년 2월 14일 오후 5시",
    },
    heroMedia: {
      type: "image",
      mobileSrc: PLACEHOLDER,
      desktopSrc: PLACEHOLDER,
      poster: PLACEHOLDER,
    },
    heroSection: {
      title:
        "2026년 2월 14일 토요일 오후 5시\n라움아트센터\n홍길동 • 홍길동의 아들 민준\n홍길동 • 홍길동의 딸 서연",
      images: heroImages,
    },
    introSection: {
      title: "오랜 시간 서로의 하루를 나누던 저희가\n이제 부부로 첫걸음을 내딛습니다.",
      description:
        "바쁜 일상 속에서도 같은 마음으로 서로를 아껴온 두 사람이\n소중한 분들을 모시고 결혼식을 올립니다.\n\n축복해 주시는 마음 오래 간직하며,\n좋은 모습으로 살아가겠습니다.",
      image: {
        src: PLACEHOLDER,
        alt: "intro-image",
      },
    },
    gallerySection: {
      title: "갤러리",
      moreLabel: "사진 더보기",
      images: galleryImages,
    },
    detailsSection: {
      venueName: "라움아트센터",
      venueDescription:
        "소중한 분들과의 시간을 편안하게 보내실 수 있도록\n예식과 식사가 한 공간에서 진행됩니다.",
      address: "서울 강남구 언주로 564",
      stationDescription: "선정릉역 4번 출구에서 도보 7분",
      mapLinks: [
        {
          name: "카카오맵",
          icon: "/icon/kakaomap.png",
          url: "https://map.kakao.com",
        },
        {
          name: "네이버맵",
          icon: "/icon/navermap.png",
          url: "https://map.naver.com",
        },
        {
          name: "티맵",
          icon: "/icon/tmap.png",
          url: "https://www.tmap.co.kr",
        },
      ],
      items: [
        {
          title: "주차 안내",
          description: "건물 내 주차 가능하며,\n2시간 무료 주차를 지원합니다.",
        },
        {
          title: "셔틀 안내",
          description: "예식 1시간 전부터 20분 간격으로 셔틀이 운행됩니다.",
        },
      ],
    },
    accountSection: {
      title: "마음 전하실 곳",
      descriptionTop: "참석이 어려우신 분들을 위해 계좌번호를 안내드립니다.",
      descriptionBottom: "축하해 주시는 마음, 감사히 받겠습니다.",
      groomTitle: "신랑측 계좌",
      brideTitle: "신부측 계좌",
      groomAccounts: [
        {
          name: "신랑",
          account: "1002-123-456789",
          bank: "우리은행",
          holder: "김민준",
        },
      ],
      brideAccounts: [
        {
          name: "신부",
          account: "110-987-654321",
          bank: "신한은행",
          holder: "이서연",
        },
      ],
    },
    share: {
      kakaoTitle: "초대합니다",
      kakaoDescription: "2026년 2월 14일 토요일 오후 5시 라움아트센터",
      imageUrl: PLACEHOLDER,
      buttonTitle: "청첩장 보기",
    },
    footer: {
      tagline: "함께해 주셔서 감사합니다.",
    },
  };
}

export type MediaType = "video" | "image";

export type ImageItem = {
  src: string;
  alt: string;
};

export type GalleryImageItem = {
  src: string;
  alt: string;
  title: string;
  aspect?: string;
};

export type MapLink = {
  name: string;
  icon: string;
  url: string;
};

export type DetailItem = {
  title: string;
  description: string;
};

export type AccountInfo = {
  name: string;
  account: string;
  bank: string;
  holder: string;
};

export type WeddingContent = {
  couple: {
    groomName: string;
    brideName: string;
    displayName: string;
  };
  wedding: {
    dateLabel: string;
    headerLabel: string;
  };
  heroMedia: {
    type: MediaType;
    mobileSrc: string;
    desktopSrc: string;
    poster: string;
  };
  heroSection: {
    title: string;
    images: ImageItem[];
  };
  introSection: {
    title: string;
    description: string;
    image: ImageItem;
  };
  gallerySection: {
    title: string;
    moreLabel: string;
    images: GalleryImageItem[];
  };
  calendarSection: {
    title: string;
    selectedDate: string; // YYYY-MM-DD
  };
  detailsSection: {
    venueName: string;
    venueDescription: string;
    address: string;
    detailAddress: string;
    stationDescription: string;
    mapLinks: MapLink[];
    items: DetailItem[];
  };
  accountSection: {
    title: string;
    descriptionTop: string;
    descriptionBottom: string;
    groomTitle: string;
    brideTitle: string;
    groomAccounts: AccountInfo[];
    brideAccounts: AccountInfo[];
  };
  share: {
    kakaoTitle: string;
    kakaoDescription: string;
    ogImageUrl: string;
    kakaoImageUrl: string;
    imageUrl: string;
    buttonTitle: string;
  };
  footer: {
    tagline: string;
    nameLine: string;
    dateLine: string;
  };
};

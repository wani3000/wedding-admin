import { defaultWeddingContent } from "@/lib/content/defaults";
import type {
  AccountInfo,
  DetailItem,
  GalleryImageItem,
  ImageItem,
  MapLink,
  MediaType,
  WeddingContent,
} from "@/lib/content/types";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asMediaType(value: unknown, fallback: MediaType): MediaType {
  return value === "video" || value === "image" ? value : fallback;
}

function asImageItem(value: unknown, fallback: ImageItem): ImageItem {
  const record = asRecord(value);
  return {
    src: asString(record.src, fallback.src),
    alt: asString(record.alt, fallback.alt),
  };
}

function asGalleryImageItem(
  value: unknown,
  fallback: GalleryImageItem,
): GalleryImageItem {
  const record = asRecord(value);
  return {
    src: asString(record.src, fallback.src),
    alt: asString(record.alt, fallback.alt),
    title: asString(record.title, fallback.title),
    aspect: asString(record.aspect, fallback.aspect || "aspect-[2/3]"),
  };
}

function asMapLink(value: unknown, fallback: MapLink): MapLink {
  const record = asRecord(value);
  return {
    name: asString(record.name, fallback.name),
    icon: asString(record.icon, fallback.icon),
    url: asString(record.url, fallback.url),
  };
}

function asDetailItem(value: unknown, fallback: DetailItem): DetailItem {
  const record = asRecord(value);
  return {
    title: asString(record.title, fallback.title),
    description: asString(record.description, fallback.description),
  };
}

function asAccountInfo(value: unknown, fallback: AccountInfo): AccountInfo {
  const record = asRecord(value);
  return {
    name: asString(record.name, fallback.name),
    account: asString(record.account, fallback.account),
    bank: asString(record.bank, fallback.bank),
    holder: asString(record.holder, fallback.holder),
  };
}

function mapArray<T>(
  value: unknown,
  fallback: T[],
  mapper: (item: unknown, fallbackItem: T) => T,
): T[] {
  if (!Array.isArray(value)) return fallback;
  return value.map((item, index) => mapper(item, fallback[index] || fallback[0]));
}

export function normalizeWeddingContent(raw: unknown): WeddingContent {
  const record = asRecord(raw);

  const couple = asRecord(record.couple);
  const wedding = asRecord(record.wedding);
  const heroMedia = asRecord(record.heroMedia);
  const heroSection = asRecord(record.heroSection);
  const introSection = asRecord(record.introSection);
  const introImage = asRecord(introSection.image);
  const gallerySection = asRecord(record.gallerySection);
  const detailsSection = asRecord(record.detailsSection);
  const accountSection = asRecord(record.accountSection);
  const share = asRecord(record.share);
  const footer = asRecord(record.footer);

  const merged: WeddingContent = {
    couple: {
      groomName: asString(couple.groomName, defaultWeddingContent.couple.groomName),
      brideName: asString(couple.brideName, defaultWeddingContent.couple.brideName),
      displayName: asString(couple.displayName, defaultWeddingContent.couple.displayName),
    },
    wedding: {
      dateLabel: asString(wedding.dateLabel, defaultWeddingContent.wedding.dateLabel),
      headerLabel: asString(
        wedding.headerLabel,
        defaultWeddingContent.wedding.headerLabel,
      ),
    },
    heroMedia: {
      type: asMediaType(heroMedia.type, defaultWeddingContent.heroMedia.type),
      mobileSrc: asString(
        heroMedia.mobileSrc,
        defaultWeddingContent.heroMedia.mobileSrc,
      ),
      desktopSrc: asString(
        heroMedia.desktopSrc,
        defaultWeddingContent.heroMedia.desktopSrc,
      ),
      poster: asString(heroMedia.poster, defaultWeddingContent.heroMedia.poster),
    },
    heroSection: {
      title: asString(heroSection.title, defaultWeddingContent.heroSection.title),
      images: mapArray(
        heroSection.images,
        defaultWeddingContent.heroSection.images,
        asImageItem,
      ),
    },
    introSection: {
      title: asString(introSection.title, defaultWeddingContent.introSection.title),
      description: asString(
        introSection.description,
        defaultWeddingContent.introSection.description,
      ),
      image: asImageItem(introImage, defaultWeddingContent.introSection.image),
    },
    gallerySection: {
      title: asString(gallerySection.title, defaultWeddingContent.gallerySection.title),
      moreLabel: asString(
        gallerySection.moreLabel,
        defaultWeddingContent.gallerySection.moreLabel,
      ),
      images: mapArray(
        gallerySection.images,
        defaultWeddingContent.gallerySection.images,
        asGalleryImageItem,
      ),
    },
    detailsSection: {
      venueName: asString(
        detailsSection.venueName,
        defaultWeddingContent.detailsSection.venueName,
      ),
      venueDescription: asString(
        detailsSection.venueDescription,
        defaultWeddingContent.detailsSection.venueDescription,
      ),
      address: asString(
        detailsSection.address,
        defaultWeddingContent.detailsSection.address,
      ),
      stationDescription: asString(
        detailsSection.stationDescription,
        defaultWeddingContent.detailsSection.stationDescription,
      ),
      mapLinks: mapArray(
        detailsSection.mapLinks,
        defaultWeddingContent.detailsSection.mapLinks,
        asMapLink,
      ),
      items: mapArray(
        detailsSection.items,
        defaultWeddingContent.detailsSection.items,
        asDetailItem,
      ),
    },
    accountSection: {
      title: asString(accountSection.title, defaultWeddingContent.accountSection.title),
      descriptionTop: asString(
        accountSection.descriptionTop,
        defaultWeddingContent.accountSection.descriptionTop,
      ),
      descriptionBottom: asString(
        accountSection.descriptionBottom,
        defaultWeddingContent.accountSection.descriptionBottom,
      ),
      groomTitle: asString(
        accountSection.groomTitle,
        defaultWeddingContent.accountSection.groomTitle,
      ),
      brideTitle: asString(
        accountSection.brideTitle,
        defaultWeddingContent.accountSection.brideTitle,
      ),
      groomAccounts: mapArray(
        accountSection.groomAccounts,
        defaultWeddingContent.accountSection.groomAccounts,
        asAccountInfo,
      ),
      brideAccounts: mapArray(
        accountSection.brideAccounts,
        defaultWeddingContent.accountSection.brideAccounts,
        asAccountInfo,
      ),
    },
    share: {
      kakaoTitle: asString(share.kakaoTitle, defaultWeddingContent.share.kakaoTitle),
      kakaoDescription: asString(
        share.kakaoDescription,
        defaultWeddingContent.share.kakaoDescription,
      ),
      imageUrl: asString(share.imageUrl, defaultWeddingContent.share.imageUrl),
      buttonTitle: asString(share.buttonTitle, defaultWeddingContent.share.buttonTitle),
    },
    footer: {
      tagline: asString(footer.tagline, defaultWeddingContent.footer.tagline),
    },
  };

  const normalized: WeddingContent = {
    ...merged,
    heroSection: {
      ...merged.heroSection,
      images: merged.heroSection.images.filter((item) => item.src !== ""),
    },
    gallerySection: {
      ...merged.gallerySection,
      images: merged.gallerySection.images.filter((item) => item.src !== ""),
    },
    detailsSection: {
      ...merged.detailsSection,
      mapLinks: merged.detailsSection.mapLinks.filter(
        (item) => item.name !== "" && item.url !== "",
      ),
      items: merged.detailsSection.items.filter((item) => item.title !== ""),
    },
    accountSection: {
      ...merged.accountSection,
      groomAccounts: merged.accountSection.groomAccounts.filter(
        (item) => item.name !== "",
      ),
      brideAccounts: merged.accountSection.brideAccounts.filter(
        (item) => item.name !== "",
      ),
    },
  };

  if (normalized.heroSection.images.length === 0) {
    normalized.heroSection.images = defaultWeddingContent.heroSection.images;
  }

  if (normalized.gallerySection.images.length === 0) {
    normalized.gallerySection.images = defaultWeddingContent.gallerySection.images;
  }

  return normalized;
}

export function validateWeddingContent(content: WeddingContent): string[] {
  const errors: string[] = [];

  if (content.couple.groomName === "") errors.push("신랑 이름은 필수입니다.");
  if (content.couple.brideName === "") errors.push("신부 이름은 필수입니다.");
  if (content.couple.displayName === "") errors.push("표시 이름은 필수입니다.");
  if (content.wedding.headerLabel === "") errors.push("헤더 날짜 문구는 필수입니다.");

  if (content.heroMedia.mobileSrc === "") {
    errors.push("히어로 모바일 미디어 경로는 필수입니다.");
  }
  if (content.heroMedia.desktopSrc === "") {
    errors.push("히어로 데스크톱 미디어 경로는 필수입니다.");
  }

  if (content.heroSection.images.length === 0) {
    errors.push("히어로 이미지는 최소 1장 필요합니다.");
  }

  if (content.gallerySection.images.length === 0) {
    errors.push("갤러리 이미지는 최소 1장 필요합니다.");
  }

  if (content.detailsSection.venueName === "") {
    errors.push("예식장 이름은 필수입니다.");
  }
  if (content.detailsSection.address === "") {
    errors.push("예식장 주소는 필수입니다.");
  }

  return errors;
}

export class ContentValidationError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    super("콘텐츠 검증 실패");
    this.name = "ContentValidationError";
    this.errors = errors;
  }
}

// 전체 갤러리 이미지 (gallery_08, gallery_11 제외)
const galleryNumbers = [1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

export const allGalleryImages = galleryNumbers.map((num) => {
  const numStr = String(num).padStart(2, "0");
  return {
    title: `Wedding Gallery ${numStr}`,
    category: "Wedding",
    src: `/img/gallery/gallery_${numStr}.jpg`,
    alt: `Wedding Photo ${numStr}`,
    aspect: "aspect-[2/3]",
  };
});

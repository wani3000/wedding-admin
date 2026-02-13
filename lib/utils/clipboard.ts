export const copyToClipboard = async (
  text: string,
  onSuccess: () => void
): Promise<void> => {
  const cleanText = text.replace(/\s/g, "");

  // 현재 스크롤 위치 저장
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(cleanText);
      onSuccess();
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = cleanText;
      // 화면 밖으로 완전히 숨기고 스크롤 영향 방지
      textArea.style.cssText =
        "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:none;outline:none;box-shadow:none;background:transparent;opacity:0;z-index:-1;";
      textArea.setAttribute("readonly", ""); // 키보드 팝업 방지 (모바일)
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);

      // 스크롤 위치 복원
      window.scrollTo(scrollX, scrollY);

      if (success) onSuccess();
    }
  } catch (err) {
    console.error("복사 실패:", err);
    // 에러 발생 시에도 스크롤 위치 복원
    window.scrollTo(scrollX, scrollY);
  }
};

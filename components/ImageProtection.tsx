"use client";

import { useEffect } from "react";

export function ImageProtection() {
  useEffect(() => {
    // 컨텍스트 메뉴 방지 (이미지 꾹 누르기)
    const preventContextMenu = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "IMG" ||
        target.tagName === "VIDEO" ||
        target.closest("img") ||
        target.closest("video")
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const preventDragStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 핀치 줌만 차단 (2개 이상 손가락)
    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventGestureZoom = (e: Event) => {
      e.preventDefault();
    };

    // contextmenu는 캡처 단계에서 처리
    document.addEventListener("contextmenu", preventContextMenu, true);
    document.addEventListener("dragstart", preventDragStart, true);
    document.addEventListener("touchmove", preventPinchZoom, {
      passive: false,
    });
    document.addEventListener("gesturestart", preventGestureZoom);
    document.addEventListener("gesturechange", preventGestureZoom);
    document.addEventListener("gestureend", preventGestureZoom);

    // 동적으로 추가되는 이미지에도 적용
    const observer = new MutationObserver(() => {
      document.querySelectorAll("img, video").forEach((el) => {
        el.addEventListener("contextmenu", preventContextMenu);
        el.addEventListener("dragstart", preventDragStart);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 초기 이미지에도 적용
    document.querySelectorAll("img, video").forEach((el) => {
      el.addEventListener("contextmenu", preventContextMenu);
      el.addEventListener("dragstart", preventDragStart);
    });

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu, true);
      document.removeEventListener("dragstart", preventDragStart, true);
      document.removeEventListener("touchmove", preventPinchZoom);
      document.removeEventListener("gesturestart", preventGestureZoom);
      document.removeEventListener("gesturechange", preventGestureZoom);
      document.removeEventListener("gestureend", preventGestureZoom);
      observer.disconnect();
    };
  }, []);

  return null;
}

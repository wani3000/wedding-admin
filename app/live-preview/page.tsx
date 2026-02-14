"use client";

import { useEffect, useMemo, useState } from "react";
import { InvitationRenderer } from "@/components/pages/InvitationRenderer";
import { createBlankWeddingContent } from "@/lib/content/blank";
import { normalizeWeddingContent } from "@/lib/content/validate";
import type { WeddingContent } from "@/lib/content/types";

type PreviewMessage = {
  type: "mariecard-live-preview";
  content?: unknown;
};

export default function LivePreviewPage() {
  const baseContent = useMemo(() => createBlankWeddingContent(), []);
  const [content, setContent] = useState<WeddingContent>(baseContent);

  useEffect(() => {
    const onMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== "mariecard-live-preview") return;
      setContent(normalizeWeddingContent(event.data.content, baseContent));
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [baseContent]);

  return <InvitationRenderer content={content} routeBasePath="" />;
}

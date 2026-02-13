import { InvitationRenderer } from "@/components/pages/InvitationRenderer";
import { defaultWeddingContent } from "@/lib/content/defaults";

export default function SamplePage() {
  return <InvitationRenderer content={defaultWeddingContent} routeBasePath="/sample" />;
}

import { redirect } from "next/navigation";

export default async function InvitationAdminRoute({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/admin/sample-editor?invitationId=${params.id}`);
}

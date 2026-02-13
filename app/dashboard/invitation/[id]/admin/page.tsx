import { redirect } from "next/navigation";

export default async function InvitationAdminRoute({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/admin?invitationId=${params.id}`);
}

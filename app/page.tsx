import { redirect } from "next/navigation";
import { LandingStart } from "@/components/pages/LandingStart";

type HomeProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function Home({ searchParams }: HomeProps) {
  const code = searchParams?.code;
  const hasCode = typeof code === "string" && code !== "";

  if (hasCode) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent("/dashboard")}`);
  }

  return <LandingStart />;
}

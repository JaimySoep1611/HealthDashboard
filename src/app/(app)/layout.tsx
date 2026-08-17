import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import { TopNav } from "@/components/TopNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/profile");
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopNav profileName={profile.name} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}

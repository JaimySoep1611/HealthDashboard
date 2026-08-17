import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import { getProfileTheme } from "@/lib/profileTheme";
import { TopNav } from "@/components/TopNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/profile");
  }

  const theme = getProfileTheme(profile.name);

  return (
    <div
      className="flex flex-1 flex-col"
      style={{ "--navy": theme.accent, "--navy-light": theme.accentLight } as React.CSSProperties}
    >
      <TopNav profileName={profile.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

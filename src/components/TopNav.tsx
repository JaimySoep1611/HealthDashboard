"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { InfoButton } from "@/components/InfoButton";

export function TopNav({ profileName }: { profileName: string }) {
  const router = useRouter();

  async function switchProfile() {
    router.push("/profile");
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
      <Link href="/dashboard" className="font-semibold tracking-tight">
        Health<span className="text-navy-light">Dashboard</span>
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        <InfoButton />
        <span className="hidden text-foreground sm:inline">{profileName}</span>
        <Link href="/onboarding" className="hover:text-foreground">
          Edit setup
        </Link>
        <button onClick={switchProfile} className="hover:text-foreground">
          Switch
        </button>
        <button onClick={logout} className="hover:text-foreground">
          Log out
        </button>
      </div>
    </header>
  );
}

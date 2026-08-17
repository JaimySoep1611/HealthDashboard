"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/dashboard" className="font-semibold tracking-tight">
        Health<span className="text-navy-light">Dashboard</span>
      </Link>
      <div className="flex items-center gap-4 text-sm text-muted">
        <span>{profileName}</span>
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

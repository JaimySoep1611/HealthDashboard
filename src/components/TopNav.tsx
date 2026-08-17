"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { InfoButton } from "@/components/InfoButton";
import { OtterLogo } from "@/components/OtterLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold tracking-tight">
        <OtterLogo size={30} />
        <span className="text-[15px] sm:text-base">
          Soephart <span className="text-navy-light">&amp;</span> Ligtenberg
        </span>
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        <ThemeToggle />
        <InfoButton />
        <span className="hidden text-foreground sm:inline">{profileName}</span>
        <Link href="/onboarding" className="hover:text-foreground">
          Edit Goals
        </Link>
        <button onClick={switchProfile} className="hover:text-foreground">
          Switch User
        </button>
        <button onClick={logout} className="hover:text-foreground">
          Log out
        </button>
      </div>
    </header>
  );
}

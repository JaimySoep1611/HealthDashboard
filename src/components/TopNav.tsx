"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/training", label: "Training", matchPrefixes: ["/training", "/steps"] },
  { href: "/nutrition", label: "Nutrition", matchPrefixes: ["/nutrition"] },
];

export function TopNav({ profileName }: { profileName: string }) {
  const router = useRouter();
  const pathname = usePathname();

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
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Health<span className="text-navy-light">Dashboard</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {NAV_LINKS.map((link) => {
            const isActive = link.matchPrefixes.some((prefix) => pathname.startsWith(prefix));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? "text-navy-light" : "text-muted hover:text-foreground"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted">
        <span>{profileName}</span>
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

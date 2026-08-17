import { prisma } from "@/lib/prisma";
import { ProfilePicker } from "./profile-picker";

export default async function ProfilePage() {
  const profiles = await prisma.profile.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="flex w-full max-w-2xl flex-col gap-6 text-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Who&apos;s tracking?</h1>
          <p className="text-sm text-muted">Pick a profile to see your dashboard.</p>
        </div>

        {profiles.length === 0 ? (
          <p className="text-sm text-muted">
            No profiles yet — run <code className="text-foreground">pnpm seed</code> to create them.
          </p>
        ) : (
          <ProfilePicker profiles={profiles.map((p) => ({ id: p.id, name: p.name }))} />
        )}
      </div>
    </main>
  );
}

import { SparkleIcon } from "@/components/icons";

function greetingFor(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHero({ name }: { name: string }) {
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="hero-card animate-pop-in flex flex-col gap-1 p-7 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative z-10 flex flex-col gap-1">
        <span className="flex items-center gap-2 text-sm text-white/70">
          <SparkleIcon size={16} />
          {dateLabel}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {greetingFor(now.getHours())}, {name}
        </h1>
        <p className="max-w-md text-sm text-white/70">
          Here&apos;s where things stand today — small consistent steps add up.
        </p>
      </div>
    </div>
  );
}

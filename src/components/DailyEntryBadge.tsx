export function DailyEntryBadge({ color }: { color: string }) {
  return (
    <span
      className="flex-none rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: `${color}1a`, color }}
      title="Set once a day — you can still edit it below anytime"
    >
      Once/day
    </span>
  );
}

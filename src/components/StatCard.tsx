import { ReactNode } from "react";

export function StatCard({
  icon,
  color,
  value,
  unit,
  label,
  children,
}: {
  icon: ReactNode;
  color: string;
  value: string | number;
  unit?: string;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className="stat-card flex items-center gap-4 p-5">
      <div
        className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          {unit && <span className="text-sm text-muted">{unit}</span>}
        </div>
        <span className="truncate text-xs text-muted">{label}</span>
      </div>
      {children}
    </div>
  );
}

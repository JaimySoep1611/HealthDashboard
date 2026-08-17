import { ReactNode } from "react";

export function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-navy-light">
      {icon}
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</h2>
    </div>
  );
}

type IconProps = { className?: string; size?: number };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function FlameIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 2.5c1.5 2 1 3.5-.3 5-1.3 1.4-2.2 2.6-2.2 4.3a3 3 0 0 0 6 0c0-.9-.3-1.5-.8-2.2 1.7 1 2.8 2.8 2.8 5a5.5 5.5 0 1 1-11 0c0-3.5 2-5.5 3.7-7.6 1.2-1.5 1.9-2.8 1.8-4.5Z" />
    </svg>
  );
}

export function DropletIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3c3 3.6 5.5 7 5.5 10a5.5 5.5 0 1 1-11 0c0-3 2.5-6.4 5.5-10Z" />
    </svg>
  );
}

export function FootprintsIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M8.5 4.5c1.5 0 2.3 1.3 2.3 3.2 0 1.6-.5 2.5-.5 3.9 0 1.5.9 2.2.9 3.6a2.5 2.5 0 0 1-5 0c0-1.7.7-2.2.7-4.2 0-1.7-.9-2.3-.9-4.2 0-1.4.8-2.3 2.5-2.3Z" />
      <path d="M16 8.5c1.5 0 2.3 1.3 2.3 3.2 0 1.6-.5 2.5-.5 3.9 0 1.5.9 2.2.9 3.6a2.5 2.5 0 0 1-5 0c0-1.7.7-2.2.7-4.2 0-1.7-.9-2.3-.9-4.2 0-1.4.8-2.3 2.5-2.3Z" />
    </svg>
  );
}

export function ScaleIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M8 15c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5" />
      <circle cx="12" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DumbbellIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="2.5" y="9" width="3.2" height="6" rx="1" fill="currentColor" stroke="none" />
      <rect x="18.3" y="9" width="3.2" height="6" rx="1" fill="currentColor" stroke="none" />
      <path d="M5.7 12h1.8M16.5 12h1.8" strokeWidth={2.4} />
      <path d="M7.5 12h9" strokeWidth={2.4} />
    </svg>
  );
}

export function TrophyIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5.5H4.5A2.5 2.5 0 0 0 7 8.8M17 5.5h2.5A2.5 2.5 0 0 1 17 8.8" />
      <path d="M12 14v3m-3 3h6m-3 0v-3" />
    </svg>
  );
}

export function TargetIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlusIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function SparkleIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" />
      <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
    </svg>
  );
}

export function TrendUpIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 16l5.5-5.5 4 4L20 8" />
      <path d="M14.5 8H20v5.5" />
    </svg>
  );
}

export function InfoIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CloseIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ClockIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function BookIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 5.5c1.8-1 4-1 5.5.3v12.2C8 16.7 5.8 16.7 4 17.7V5.5Z" />
      <path d="M20 5.5c-1.8-1-4-1-5.5.3v12.2c1.5-1.3 3.7-1.3 5.5-.3V5.5Z" />
    </svg>
  );
}

export function SunIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </svg>
  );
}

export function MoonIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function CheckIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function PushIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 19V7M7 11l5-5 5 5" />
    </svg>
  );
}

export function PullIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 5v12M7 13l5 5 5-5" />
    </svg>
  );
}

export function LegsIcon({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M8 4h8M9 4v9l-2 7M15 4v9l2 7" />
    </svg>
  );
}

export function StarIcon({ className, size = 20, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      {...base}
      fill={filled ? "currentColor" : "none"}
    >
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8Z" />
    </svg>
  );
}

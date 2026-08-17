export function OtterLogo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`flex flex-none items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.66} height={size * 0.66}>
        <circle cx="7" cy="6.6" r="2.3" fill="white" />
        <circle cx="17" cy="6.6" r="2.3" fill="white" />
        <circle cx="12" cy="12.6" r="6.8" fill="white" />
        <ellipse cx="12" cy="14.6" rx="4.1" ry="3.1" fill="var(--navy)" />
        <circle cx="9.4" cy="10.8" r="0.9" fill="var(--navy)" />
        <circle cx="14.6" cy="10.8" r="0.9" fill="var(--navy)" />
        <path d="M11 14 L13 14 L12 15.4 Z" fill="var(--navy)" />
        <g stroke="var(--navy)" strokeWidth="0.7" strokeLinecap="round">
          <path d="M6 15 L2.5 14.3" />
          <path d="M6 16.3 L2.5 16.6" />
          <path d="M18 15 L21.5 14.3" />
          <path d="M18 16.3 L21.5 16.6" />
        </g>
      </svg>
    </div>
  );
}

export function Sparkline({
  id,
  points,
  color,
  height = 64,
  target,
  scaleMin,
  scaleMax,
}: {
  id: string;
  points: number[];
  color: string;
  height?: number;
  target?: number;
  // Override the auto-computed vertical scale — used when a caller renders its
  // own axis labels/gridlines and needs the line to line up with them exactly.
  scaleMin?: number;
  scaleMax?: number;
}) {
  const width = 100;
  const max = scaleMax ?? Math.max(...points, target ?? 0, 1);
  const min = scaleMin ?? Math.min(...points, target ?? Infinity, 0);
  const range = max - min || 1;

  const step = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((value, index) => ({
    x: index * step,
    y: height - ((value - min) / range) * (height - 8) - 4,
  }));

  const linePath = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const targetY =
    target !== undefined ? height - ((target - min) / range) * (height - 8) - 4 : null;
  const gradientId = `sparkline-gradient-${id}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-full w-full overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {targetY !== null && (
        <line
          x1={0}
          y1={targetY}
          x2={width}
          y2={targetY}
          stroke="var(--muted)"
          strokeWidth={0.5}
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

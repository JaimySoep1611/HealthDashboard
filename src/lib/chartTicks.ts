// Classic "nice number" rounding (Heckbert, 1990): rounds a raw step to the
// nearest of 1/2/5/10 (scaled by a power of ten) so axis milestones land on
// numbers a human would actually pick — 500/1000/1500/2000, not 437/874/...
function niceStep(value: number): number {
  if (value <= 0) return 0;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction: number;

  if (fraction < 1.5) niceFraction = 1;
  else if (fraction < 3) niceFraction = 2;
  else if (fraction < 7) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * Math.pow(10, exponent);
}

// Generates ascending, evenly-spaced round-number ticks covering [min, max],
// e.g. niceTicks(0, 2000, 4) -> [0, 500, 1000, 1500, 2000].
export function niceTicks(min: number, max: number, targetCount = 4): number[] {
  if (max <= min) return [min];

  const rawStep = (max - min) / (targetCount - 1);
  const step = niceStep(rawStep) || 1;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let value = niceMin; value <= niceMax + step / 2; value += step) {
    ticks.push(Math.round(value * 1000) / 1000);
  }
  return ticks;
}

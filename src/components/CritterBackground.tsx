// Fixed, hand-picked set (not random) so this needs no client-side state or
// effects — just a purely decorative, CSS-animated background, opt-in via
// "Edit Goals" and rendered behind everything else.
const CRITTERS = [
  { emoji: "🦦", top: "6%", duration: 32, delay: -2 },
  { emoji: "🐶", top: "18%", duration: 26, delay: -16 },
  { emoji: "🦦", top: "32%", duration: 38, delay: -9 },
  { emoji: "🐶", top: "46%", duration: 29, delay: -22 },
  { emoji: "🦦", top: "58%", duration: 34, delay: -4 },
  { emoji: "🐶", top: "70%", duration: 27, delay: -18 },
  { emoji: "🦦", top: "82%", duration: 36, delay: -30 },
  { emoji: "🐶", top: "92%", duration: 24, delay: -11 },
];

export function CritterBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {CRITTERS.map((critter, index) => (
        <span
          key={index}
          className="absolute text-2xl opacity-60 sm:text-3xl"
          style={{
            top: critter.top,
            animation: `critter-drift ${critter.duration}s linear infinite`,
            animationDelay: `${critter.delay}s`,
          }}
        >
          {critter.emoji}
        </span>
      ))}
    </div>
  );
}

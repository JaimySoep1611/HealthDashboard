"use client";

import { useEffect, useState } from "react";

const COLORS = ["#06b6d4", "#3b82f6", "#f97316", "#8b5cf6", "#34d399", "#facc15"];
const PIECE_COUNT = 28;

type Piece = { id: number; left: number; color: string; delay: number; drift: number };

function randomPieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 0.25,
    drift: (Math.random() - 0.5) * 140,
  }));
}

// Fire by bumping `burstKey` (e.g. a counter state) — every change spawns a
// fresh burst, even to the same value-that-isn't-0 twice in a row.
export function Confetti({ burstKey }: { burstKey: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (burstKey === 0) return;
    // Math.random() needs to run post-mount, not during render — this effect
    // exists purely to react to burstKey changing, same as the theme toggle
    // / useTodayWeekday pattern used elsewhere for client-only randomness/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(randomPieces());
    const timeout = setTimeout(() => setPieces([]), 1700);
    return () => clearTimeout(timeout);
  }, [burstKey]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-[-12px] h-2.5 w-2.5 rounded-sm"
          style={
            {
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animation: `confetti-fall 1.3s ease-in ${piece.delay}s forwards`,
              "--confetti-drift": `${piece.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

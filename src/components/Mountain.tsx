import { useMemo } from "react";

interface MountainProps {
  /** 0 (gone) to 1 (full size) */
  size: number;
  /** Trigger shake-grow animation when true */
  relapsing?: boolean;
  /** Trigger shrink celebration */
  shrinking?: boolean;
  className?: string;
}

/**
 * Cartoon illustrated mountain. Scales smoothly based on `size`.
 * Includes sky, stars, snowy peaks, foreground ridges, and a sun glow.
 */
export function Mountain({ size, relapsing, shrinking, className }: MountainProps) {
  // Clamp size between a tiny molehill (0.08) and full Everest (1)
  const s = Math.max(0.08, Math.min(1, size));

  const stars = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({
      cx: (i * 137.5) % 800,
      cy: ((i * 71) % 220),
      r: (i % 3) * 0.6 + 0.4,
      o: ((i * 13) % 60) / 100 + 0.3,
    })),
    [],
  );

  return (
    <div className={className}>
      <svg
        viewBox="0 0 800 500"
        className={`w-full h-auto ${relapsing ? "animate-shake" : ""}`}
        style={{ filter: relapsing ? "drop-shadow(0 0 30px oklch(0.62 0.24 25 / 0.6))" : undefined }}
      >
        <defs>
          <radialGradient id="sky" cx="50%" cy="80%" r="80%">
            <stop offset="0%" stopColor="oklch(0.32 0.18 265)" />
            <stop offset="100%" stopColor="oklch(0.08 0.04 260)" />
          </radialGradient>
          <linearGradient id="mtnBig" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.5 0.14 250)" />
            <stop offset="60%" stopColor="oklch(0.28 0.1 258)" />
            <stop offset="100%" stopColor="oklch(0.14 0.06 260)" />
          </linearGradient>
          <linearGradient id="mtnSide" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.4 0.12 255)" />
            <stop offset="100%" stopColor="oklch(0.16 0.06 260)" />
          </linearGradient>
          <linearGradient id="snow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.98 0.01 240)" />
            <stop offset="100%" stopColor="oklch(0.78 0.04 240)" />
          </linearGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.9 0.1 240 / 0.5)" />
            <stop offset="100%" stopColor="oklch(0.9 0.1 240 / 0)" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="800" height="500" fill="url(#sky)" />
        {/* Stars */}
        {stars.map((st, i) => (
          <circle key={i} cx={st.cx} cy={st.cy} r={st.r} fill="white" opacity={st.o} />
        ))}
        {/* Moon */}
        <g className="animate-float" style={{ transformOrigin: "650px 110px" }}>
          <circle cx="650" cy="110" r="80" fill="url(#moonGlow)" />
          <circle cx="650" cy="110" r="34" fill="oklch(0.96 0.03 240)" />
          <circle cx="640" cy="100" r="6" fill="oklch(0.82 0.04 240)" opacity="0.6" />
          <circle cx="660" cy="120" r="4" fill="oklch(0.82 0.04 240)" opacity="0.6" />
        </g>

        {/* Far ridges always present */}
        <path d="M0 400 L150 320 L260 360 L380 300 L520 350 L680 290 L800 340 L800 500 L0 500 Z"
          fill="oklch(0.18 0.06 260)" opacity="0.7" />

        {/* Main mountain - scales with `s` */}
        <g
          style={{
            transformOrigin: "400px 460px",
            transform: `scale(${0.35 + s * 0.65})`,
            transition: shrinking
              ? "transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : relapsing
              ? "transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)"
              : "transform 1s ease",
          }}
          className={!relapsing && !shrinking ? "animate-pulse-glow" : ""}
        >
          {/* Side peak */}
          <path d="M150 460 L290 230 L380 460 Z" fill="url(#mtnSide)" />
          <path d="M290 230 L320 280 L260 280 Z" fill="url(#snow)" />

          {/* Main peak */}
          <path d="M260 460 L430 100 L600 460 Z" fill="url(#mtnBig)" />
          {/* Snow cap */}
          <path d="M430 100 L500 250 L460 245 L430 270 L400 245 L360 250 Z" fill="url(#snow)" />
          {/* Shadow side */}
          <path d="M430 100 L600 460 L500 460 L430 220 Z" fill="oklch(0.1 0.04 260)" opacity="0.35" />

          {/* Right peak */}
          <path d="M520 460 L640 250 L740 460 Z" fill="url(#mtnSide)" />
          <path d="M640 250 L670 300 L610 300 Z" fill="url(#snow)" />
        </g>

        {/* Foreground silhouette */}
        <path d="M0 470 L120 440 L240 460 L380 435 L520 455 L680 430 L800 460 L800 500 L0 500 Z"
          fill="oklch(0.08 0.03 260)" />
      </svg>
    </div>
  );
}

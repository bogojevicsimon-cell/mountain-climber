import { useMemo } from "react";

interface MountainProps {
  /** 0 (gone) to 1 (full size) */
  size: number;
  /** Trigger shake-grow animation when true */
  relapsing?: boolean;
  /** Trigger shrink celebration */
  shrinking?: boolean;
  /** Changes each time the user triggers an effect so animations restart */
  fxKey?: number;
  className?: string;
}

/**
 * Dramatic cartoon mountain. Jagged rocky peaks with shadow facets,
 * snow caps, crevices, and atmospheric depth. When `shrinking` is true a
 * pickaxe swings in to chip away at the peak; rock debris and dust fly out.
 * When `relapsing` the whole scene rumbles and rocks fall back onto the
 * mountain in a cloud of rising dust.
 */
export function Mountain({ size, relapsing, shrinking, fxKey = 0, className }: MountainProps) {
  const s = Math.max(0.08, Math.min(1, size));

  const stars = useMemo(
    () => Array.from({ length: 50 }, (_, i) => ({
      cx: (i * 137.5) % 800,
      cy: ((i * 71) % 230),
      r: (i % 3) * 0.6 + 0.4,
      o: ((i * 13) % 60) / 100 + 0.3,
    })),
    [],
  );

  // Deterministic random for debris/dust
  const rand = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };

  // Strike points around the peak (in scaled mountain group coords)
  const strikePoints = [
    { x: 430, y: 130 },
    { x: 405, y: 165 },
    { x: 455, y: 175 },
  ];

  // 18 debris rocks launching outward from peak
  const debris = useMemo(
    () => Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2 + rand(i + 1) * 0.6;
      const dist = 140 + rand(i + 7) * 180;
      const sp = strikePoints[i % strikePoints.length];
      return {
        x: sp.x + (rand(i + 3) - 0.5) * 20,
        y: sp.y + (rand(i + 4) - 0.5) * 20,
        size: 3 + rand(i + 5) * 6,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist * 0.6 + 80, // gravity pulls down
        rot: (rand(i + 6) - 0.5) * 720,
        delay: (i % 6) * 0.18 + rand(i) * 0.08,
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fxKey],
  );

  // 14 dust puffs at strike points
  const dust = useMemo(
    () => Array.from({ length: 14 }, (_, i) => {
      const sp = strikePoints[i % strikePoints.length];
      return {
        x: sp.x + (rand(i + 21) - 0.5) * 40,
        y: sp.y + (rand(i + 22) - 0.5) * 30,
        r: 14 + rand(i + 23) * 18,
        dx: (rand(i + 24) - 0.5) * 80,
        dy: -20 - rand(i + 25) * 50,
        delay: (i % 6) * 0.18 + rand(i + 26) * 0.1,
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fxKey],
  );

  // Relapse: falling rocks piling onto mountain
  const fallingRocks = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      x: 260 + rand(i + 31) * 340,
      y: 280 + rand(i + 32) * 80,
      size: 5 + rand(i + 33) * 9,
      tx: (rand(i + 34) - 0.5) * 80,
      ty: 80 + rand(i + 35) * 100,
      rot: (rand(i + 36) - 0.5) * 540,
      delay: rand(i + 37) * 0.6,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fxKey],
  );

  const risingDust = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({
      x: 280 + rand(i + 41) * 320,
      y: 420 + rand(i + 42) * 30,
      r: 22 + rand(i + 43) * 22,
      dx: (rand(i + 44) - 0.5) * 60,
      delay: rand(i + 45) * 0.5,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fxKey],
  );

  return (
    <div className={className}>
      <svg
        viewBox="0 0 800 500"
        className={`w-full h-auto ${relapsing ? "animate-rumble" : ""}`}
        style={{ filter: relapsing ? "drop-shadow(0 0 30px oklch(0.62 0.24 25 / 0.6))" : undefined }}
      >
        <defs>
          <radialGradient id="sky" cx="50%" cy="80%" r="80%">
            <stop offset="0%" stopColor="oklch(0.32 0.18 265)" />
            <stop offset="100%" stopColor="oklch(0.08 0.04 260)" />
          </radialGradient>
          <linearGradient id="mtnBig" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.14 250)" />
            <stop offset="55%" stopColor="oklch(0.3 0.1 258)" />
            <stop offset="100%" stopColor="oklch(0.12 0.06 260)" />
          </linearGradient>
          <linearGradient id="mtnSide" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.42 0.12 255)" />
            <stop offset="100%" stopColor="oklch(0.14 0.06 260)" />
          </linearGradient>
          <linearGradient id="mtnShadow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.1 0.04 260)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="oklch(0.1 0.04 260)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="snow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.98 0.01 240)" />
            <stop offset="100%" stopColor="oklch(0.78 0.04 240)" />
          </linearGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.9 0.1 240 / 0.5)" />
            <stop offset="100%" stopColor="oklch(0.9 0.1 240 / 0)" />
          </radialGradient>
          <radialGradient id="dustGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.85 0.04 80 / 0.9)" />
            <stop offset="60%" stopColor="oklch(0.7 0.05 70 / 0.4)" />
            <stop offset="100%" stopColor="oklch(0.6 0.05 70 / 0)" />
          </radialGradient>
          <radialGradient id="flashGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(1 0.05 90 / 0.95)" />
            <stop offset="40%" stopColor="oklch(0.9 0.18 70 / 0.6)" />
            <stop offset="100%" stopColor="oklch(0.8 0.2 60 / 0)" />
          </radialGradient>
          <linearGradient id="pickHandle" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.35 0.08 50)" />
            <stop offset="100%" stopColor="oklch(0.22 0.06 40)" />
          </linearGradient>
          <linearGradient id="pickHead" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.75 0.02 240)" />
            <stop offset="100%" stopColor="oklch(0.35 0.02 240)" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="800" height="500" fill="url(#sky)" />
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

        {/* Far ridges */}
        <path d="M0 410 L90 340 L160 380 L240 320 L320 360 L400 310 L480 350 L560 305 L640 345 L720 300 L800 340 L800 500 L0 500 Z"
          fill="oklch(0.18 0.06 260)" opacity="0.55" />
        <path d="M0 440 L120 390 L220 420 L340 380 L460 415 L580 375 L700 410 L800 390 L800 500 L0 500 Z"
          fill="oklch(0.15 0.05 260)" opacity="0.7" />

        {/* Main mountain group - scales with `s` */}
        <g
          style={{
            transformOrigin: "400px 460px",
            transform: `scale(${0.35 + s * 0.65})`,
            transition: shrinking
              ? "transform 1.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : relapsing
              ? "transform 0.9s cubic-bezier(0.68, -0.55, 0.27, 1.55)"
              : "transform 1s ease",
          }}
          className={!relapsing && !shrinking ? "animate-pulse-glow" : ""}
        >
          {/* === Left jagged peak === */}
          <path d="M120 460 L200 320 L235 350 L275 240 L310 290 L355 460 Z" fill="url(#mtnSide)" />
          {/* facet shadow */}
          <path d="M275 240 L310 290 L355 460 L300 460 L260 320 Z" fill="oklch(0.1 0.04 260)" opacity="0.35" />
          {/* snow */}
          <path d="M275 240 L300 280 L285 282 L275 295 L262 280 L255 275 Z" fill="url(#snow)" />
          <path d="M235 350 L255 370 L225 372 Z" fill="url(#snow)" opacity="0.85" />

          {/* === Main peak (jagged silhouette) === */}
          <path
            d="M230 460
               L300 360
               L335 380
               L370 280
               L395 320
               L430 120
               L455 200
               L478 170
               L505 260
               L540 230
               L570 320
               L600 290
               L640 460 Z"
            fill="url(#mtnBig)"
          />
          {/* Shadow side */}
          <path
            d="M430 120 L455 200 L478 170 L505 260 L540 230 L570 320 L600 290 L640 460 L540 460 L470 280 Z"
            fill="url(#mtnShadow)"
          />
          {/* Crevice lines for depth */}
          <path d="M430 140 L420 240 L408 320 L395 400 L385 460" stroke="oklch(0.08 0.03 260)" strokeWidth="2" fill="none" opacity="0.55" />
          <path d="M460 220 L482 300 L500 380 L515 460" stroke="oklch(0.08 0.03 260)" strokeWidth="1.5" fill="none" opacity="0.4" />
          <path d="M380 320 L360 400 L348 460" stroke="oklch(0.08 0.03 260)" strokeWidth="1.5" fill="none" opacity="0.4" />

          {/* Snow cap - jagged */}
          <path
            d="M430 120
               L445 165 L460 150 L470 195 L455 200
               L450 215 L438 205 L425 225 L415 210
               L405 230 L395 215 L390 240
               L405 250 L420 235 L432 248 L444 232 L455 245
               L465 230 L478 248 L470 215 Z"
            fill="url(#snow)"
          />
          {/* Snow drip lines */}
          <path d="M420 240 L416 280 L412 300" stroke="oklch(0.92 0.02 240)" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
          <path d="M445 245 L448 285 L444 305" stroke="oklch(0.92 0.02 240)" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
          <path d="M390 235 L386 270" stroke="oklch(0.92 0.02 240)" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round" />

          {/* Rocky highlight chunks */}
          <path d="M370 280 L395 320 L375 330 Z" fill="oklch(0.55 0.12 250)" opacity="0.5" />
          <path d="M505 260 L540 230 L530 275 Z" fill="oklch(0.5 0.12 250)" opacity="0.45" />
          <path d="M335 380 L370 280 L380 380 Z" fill="oklch(0.4 0.12 255)" opacity="0.3" />

          {/* === Right jagged peak === */}
          <path d="M520 460 L580 330 L615 360 L650 250 L685 310 L720 290 L760 460 Z" fill="url(#mtnSide)" />
          <path d="M650 250 L685 310 L720 290 L760 460 L700 460 L660 320 Z" fill="oklch(0.1 0.04 260)" opacity="0.4" />
          <path d="M650 250 L668 285 L658 290 L650 305 L640 290 L632 282 Z" fill="url(#snow)" />
          <path d="M615 360 L632 380 L605 382 Z" fill="url(#snow)" opacity="0.85" />
        </g>

        {/* ===== CHIPPING FX (shrinking) ===== */}
        {shrinking && (
          <g key={`chip-${fxKey}`}>
            {/* Impact flashes at strike points */}
            {strikePoints.map((p, i) => (
              <circle
                key={`flash-${i}`}
                cx={p.x}
                cy={p.y}
                r="22"
                fill="url(#flashGrad)"
                className="animate-impact"
                style={{ animationDelay: `${i * 0.34 + 0.18}s` }}
              />
            ))}

            {/* Pickaxe — swings in from upper right */}
            <g className="animate-pickaxe" style={{ transformOrigin: "430px 130px" }}>
              <g transform="translate(430 130)">
                {/* Handle */}
                <rect x="-4" y="0" width="8" height="90" rx="3" fill="url(#pickHandle)" />
                <rect x="-4" y="0" width="8" height="90" rx="3" fill="oklch(0.15 0.03 40)" opacity="0.25" />
                {/* Grip wrap */}
                <rect x="-5" y="60" width="10" height="22" rx="2" fill="oklch(0.2 0.04 30)" />
                {/* Head */}
                <path d="M-46 -10 L46 -10 L36 8 L-36 8 Z" fill="url(#pickHead)" />
                <path d="M-46 -10 L-58 -2 L-36 8 Z" fill="oklch(0.7 0.02 240)" />
                <path d="M46 -10 L58 -2 L36 8 Z" fill="oklch(0.7 0.02 240)" />
                <rect x="-6" y="-12" width="12" height="14" rx="2" fill="oklch(0.45 0.02 240)" />
                {/* Highlight */}
                <path d="M-44 -8 L42 -8" stroke="oklch(0.95 0.01 240)" strokeWidth="1.5" opacity="0.6" />
              </g>
            </g>

            {/* Debris rocks flying outward */}
            {debris.map((d, i) => (
              <g
                key={`debris-${i}`}
                className="debris"
                style={{
                  // @ts-expect-error CSS vars
                  "--tx": `${d.tx}px`,
                  "--ty": `${d.ty}px`,
                  "--rot": `${d.rot}deg`,
                  "--delay": `${d.delay}s`,
                }}
              >
                <polygon
                  points={`${d.x},${d.y - d.size} ${d.x + d.size},${d.y} ${d.x + d.size * 0.4},${d.y + d.size} ${d.x - d.size * 0.6},${d.y + d.size * 0.7} ${d.x - d.size},${d.y - d.size * 0.2}`}
                  fill={i % 3 === 0 ? "oklch(0.92 0.02 240)" : "oklch(0.35 0.08 258)"}
                  stroke="oklch(0.12 0.04 260)"
                  strokeWidth="0.5"
                />
              </g>
            ))}

            {/* Dust puffs */}
            {dust.map((d, i) => (
              <circle
                key={`dust-${i}`}
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill="url(#dustGrad)"
                className="dust"
                style={{
                  // @ts-expect-error CSS vars
                  "--dx": `${d.dx}px`,
                  "--dy": `${d.dy}px`,
                  "--delay": `${d.delay}s`,
                }}
              />
            ))}
          </g>
        )}

        {/* ===== RELAPSE FX ===== */}
        {relapsing && (
          <g key={`relapse-${fxKey}`}>
            {/* Falling rocks piling onto mountain */}
            {fallingRocks.map((r, i) => (
              <g
                key={`fall-${i}`}
                className="rock-fall"
                style={{
                  // @ts-expect-error CSS vars
                  "--tx": `${r.tx}px`,
                  "--ty": `${r.ty}px`,
                  "--rot": `${r.rot}deg`,
                  "--delay": `${r.delay}s`,
                }}
              >
                <polygon
                  points={`${r.x},${r.y - r.size} ${r.x + r.size},${r.y} ${r.x + r.size * 0.5},${r.y + r.size} ${r.x - r.size * 0.7},${r.y + r.size * 0.6} ${r.x - r.size},${r.y - r.size * 0.3}`}
                  fill="oklch(0.3 0.08 258)"
                  stroke="oklch(0.1 0.04 260)"
                  strokeWidth="0.6"
                />
              </g>
            ))}
            {/* Rising dust */}
            {risingDust.map((d, i) => (
              <circle
                key={`rdust-${i}`}
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill="url(#dustGrad)"
                className="dust-rise"
                style={{
                  // @ts-expect-error CSS vars
                  "--dx": `${d.dx}px`,
                  "--delay": `${d.delay}s`,
                }}
              />
            ))}
          </g>
        )}

        {/* Foreground silhouette */}
        <path d="M0 470 L120 440 L240 460 L380 435 L520 455 L680 430 L800 460 L800 500 L0 500 Z"
          fill="oklch(0.06 0.03 260)" />
      </svg>
    </div>
  );
}

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
    () => Array.from({ length: 80 }, (_, i) => ({
      cx: (i * 137.5) % 1000,
      cy: ((i * 71) % 280),
      r: (i % 3) * 0.6 + 0.4,
      o: ((i * 13) % 60) / 100 + 0.3,
    })),
    [],
  );

  const rand = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };

  const strikePoints = [
    { x: 530, y: 155 },
    { x: 505, y: 195 },
    { x: 555, y: 205 },
  ];

  // 24 debris rocks launching outward from peak
  const debris = useMemo(
    () => Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2 + rand(i + 1) * 0.6;
      const dist = 160 + rand(i + 7) * 220;
      const sp = strikePoints[i % strikePoints.length];
      return {
        x: sp.x + (rand(i + 3) - 0.5) * 24,
        y: sp.y + (rand(i + 4) - 0.5) * 24,
        size: 3 + rand(i + 5) * 8,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist * 0.6 + 100,
        rot: (rand(i + 6) - 0.5) * 720,
        delay: (i % 8) * 0.15 + rand(i) * 0.08,
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fxKey],
  );

  // 18 dust puffs at strike points
  const dust = useMemo(
    () => Array.from({ length: 18 }, (_, i) => {
      const sp = strikePoints[i % strikePoints.length];
      return {
        x: sp.x + (rand(i + 21) - 0.5) * 50,
        y: sp.y + (rand(i + 22) - 0.5) * 40,
        r: 16 + rand(i + 23) * 22,
        dx: (rand(i + 24) - 0.5) * 100,
        dy: -25 - rand(i + 25) * 60,
        delay: (i % 8) * 0.15 + rand(i + 26) * 0.1,
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fxKey],
  );

  // Relapse: 20 falling rocks piling onto mountain
  const fallingRocks = useMemo(
    () => Array.from({ length: 20 }, (_, i) => ({
      x: 300 + rand(i + 31) * 400,
      y: 300 + rand(i + 32) * 100,
      size: 6 + rand(i + 33) * 12,
      tx: (rand(i + 34) - 0.5) * 100,
      ty: 100 + rand(i + 35) * 140,
      rot: (rand(i + 36) - 0.5) * 540,
      delay: rand(i + 37) * 0.7,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fxKey],
  );

  const risingDust = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      x: 320 + rand(i + 41) * 360,
      y: 480 + rand(i + 42) * 40,
      r: 26 + rand(i + 43) * 28,
      dx: (rand(i + 44) - 0.5) * 80,
      delay: rand(i + 45) * 0.5,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fxKey],
  );

  return (
    <div className={className}>
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        className={`w-full h-auto ${relapsing ? "animate-rumble" : ""}`}
        style={{ filter: relapsing ? "drop-shadow(0 0 40px oklch(0.62 0.24 25 / 0.7))" : undefined }}
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
          {/* Aurora glow at base */}
          <radialGradient id="auroraGlow" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor="oklch(0.5 0.2 240 / 0.15)" />
            <stop offset="100%" stopColor="oklch(0.5 0.2 240 / 0)" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="1000" height="600" fill="url(#sky)" />
        {/* Aurora glow at base */}
        <rect width="1000" height="600" fill="url(#auroraGlow)" />
        {stars.map((st, i) => (
          <circle key={i} cx={st.cx} cy={st.cy} r={st.r} fill="white" opacity={st.o} />
        ))}
        {/* Moon */}
        <g className="animate-float" style={{ transformOrigin: "820px 130px" }}>
          <circle cx="820" cy="130" r="100" fill="url(#moonGlow)" />
          <circle cx="820" cy="130" r="42" fill="oklch(0.96 0.03 240)" />
          <circle cx="808" cy="118" r="8" fill="oklch(0.82 0.04 240)" opacity="0.6" />
          <circle cx="835" cy="145" r="5" fill="oklch(0.82 0.04 240)" opacity="0.6" />
        </g>

        {/* Far ridges */}
        <path d="M0 490 L110 410 L200 450 L300 380 L400 430 L500 370 L600 420 L700 365 L800 410 L900 370 L1000 410 L1000 600 L0 600 Z"
          fill="oklch(0.18 0.06 260)" opacity="0.55" />
        <path d="M0 530 L150 470 L280 500 L420 460 L580 495 L720 450 L880 490 L1000 470 L1000 600 L0 600 Z"
          fill="oklch(0.15 0.05 260)" opacity="0.7" />

        {/* Main mountain group - scales with `s` */}
        <g
          style={{
            transformOrigin: "500px 560px",
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
          <path d="M150 560 L250 390 L290 420 L340 290 L385 350 L440 560 Z" fill="url(#mtnSide)" />
          <path d="M340 290 L385 350 L440 560 L370 560 L320 400 Z" fill="oklch(0.1 0.04 260)" opacity="0.35" />
          <path d="M340 290 L370 340 L355 342 L340 360 L325 345 L315 338 Z" fill="url(#snow)" />
          <path d="M290 420 L315 445 L280 448 Z" fill="url(#snow)" opacity="0.85" />

          {/* === Main peak (jagged silhouette) === */}
          <path
            d="M280 560
               L370 440
               L410 460
               L460 340
               L495 390
               L530 140
               L565 240
               L595 200
               L630 310
               L670 270
               L710 380
               L750 350
               L800 560 Z"
            fill="url(#mtnBig)"
          />
          {/* Shadow side */}
          <path
            d="M530 140 L565 240 L595 200 L630 310 L670 270 L710 380 L750 350 L800 560 L670 560 L580 340 Z"
            fill="url(#mtnShadow)"
          />
          {/* Crevice lines for depth */}
          <path d="M530 170 L518 290 L505 380 L490 480 L478 560" stroke="oklch(0.08 0.03 260)" strokeWidth="2.5" fill="none" opacity="0.55" />
          <path d="M570 260 L598 360 L620 450 L640 560" stroke="oklch(0.08 0.03 260)" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M470 390 L445 480 L430 560" stroke="oklch(0.08 0.03 260)" strokeWidth="2" fill="none" opacity="0.4" />

          {/* Snow cap - jagged */}
          <path
            d="M530 140
               L548 195 L565 178 L578 230 L560 240
               L555 258 L540 245 L525 268 L515 252
               L505 275 L495 258 L488 288
               L505 300 L522 282 L538 296 L555 278 L570 292
               L582 275 L595 296 L585 258 Z"
            fill="url(#snow)"
          />
          {/* Snow drip lines */}
          <path d="M515 288 L510 335 L505 360" stroke="oklch(0.92 0.02 240)" strokeWidth="3.5" fill="none" opacity="0.8" strokeLinecap="round" />
          <path d="M548 295 L552 340 L547 365" stroke="oklch(0.92 0.02 240)" strokeWidth="3.5" fill="none" opacity="0.8" strokeLinecap="round" />
          <path d="M488 282 L483 320" stroke="oklch(0.92 0.02 240)" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round" />

          {/* Rocky highlight chunks */}
          <path d="M460 340 L495 390 L470 400 Z" fill="oklch(0.55 0.12 250)" opacity="0.5" />
          <path d="M630 310 L670 270 L658 325 Z" fill="oklch(0.5 0.12 250)" opacity="0.45" />
          <path d="M410 460 L460 340 L472 460 Z" fill="oklch(0.4 0.12 255)" opacity="0.3" />

          {/* === Right jagged peak === */}
          <path d="M640 560 L710 400 L755 430 L800 300 L840 370 L880 350 L940 560 Z" fill="url(#mtnSide)" />
          <path d="M800 300 L840 370 L880 350 L940 560 L860 560 L810 390 Z" fill="oklch(0.1 0.04 260)" opacity="0.4" />
          <path d="M800 300 L822 340 L810 345 L800 362 L790 345 L780 338 Z" fill="url(#snow)" />
          <path d="M755 430 L775 455 L745 458 Z" fill="url(#snow)" opacity="0.85" />
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
                r="28"
                fill="url(#flashGrad)"
                className="animate-impact"
                style={{ animationDelay: `${i * 0.34 + 0.18}s` }}
              />
            ))}

            {/* Pickaxe — swings in from upper right */}
            <g className="animate-pickaxe" style={{ transformOrigin: "530px 155px" }}>
              <g transform="translate(530 155)">
                {/* Handle */}
                <rect x="-5" y="0" width="10" height="110" rx="4" fill="url(#pickHandle)" />
                <rect x="-5" y="0" width="10" height="110" rx="4" fill="oklch(0.15 0.03 40)" opacity="0.25" />
                {/* Grip wrap */}
                <rect x="-6" y="72" width="12" height="28" rx="3" fill="oklch(0.2 0.04 30)" />
                {/* Head */}
                <path d="M-56 -12 L56 -12 L44 10 L-44 10 Z" fill="url(#pickHead)" />
                <path d="M-56 -12 L-70 -2 L-44 10 Z" fill="oklch(0.7 0.02 240)" />
                <path d="M56 -12 L70 -2 L44 10 Z" fill="oklch(0.7 0.02 240)" />
                <rect x="-7" y="-14" width="14" height="16" rx="3" fill="oklch(0.45 0.02 240)" />
                {/* Highlight */}
                <path d="M-54 -9 L52 -9" stroke="oklch(0.95 0.01 240)" strokeWidth="2" opacity="0.6" />
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
                  strokeWidth="0.6"
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
                  strokeWidth="0.8"
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
        <path d="M0 570 L150 530 L300 555 L480 525 L650 545 L850 515 L1000 545 L1000 600 L0 600 Z"
          fill="oklch(0.06 0.03 260)" />
      </svg>
    </div>
  );
}

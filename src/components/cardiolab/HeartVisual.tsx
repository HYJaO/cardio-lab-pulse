/**
 * Abstract 2D cardiovascular visualization: anatomical heart silhouette,
 * blood-flow lines, arterial branching, ECG trace and drifting particles.
 */
export function HeartVisual({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 520"
      role="img"
      aria-label="Abstract cardiovascular illustration with heart silhouette, blood flow lines and an ECG trace"
      className={className}
    >
      <defs>
        <radialGradient id="cl-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--electric)" stopOpacity="0.35" />
          <stop offset="60%" stopColor="var(--cyan)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cl-heart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.5" />
          <stop offset="55%" stopColor="var(--electric)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--crimson)" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="cl-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" />
          <stop offset="100%" stopColor="var(--electric)" />
        </linearGradient>
      </defs>

      <circle cx="280" cy="240" r="230" fill="url(#cl-glow)" />
      <circle
        cx="280"
        cy="240"
        r="176"
        fill="none"
        stroke="var(--hairline)"
        strokeDasharray="2 8"
      />
      <circle cx="280" cy="240" r="120" fill="none" stroke="var(--hairline)" />

      {/* arterial branching */}
      <g stroke="var(--teal)" strokeOpacity="0.35" fill="none" strokeWidth="1">
        <path d="M280 120 L280 60 M280 80 L232 44 M280 80 L330 44 M232 44 L206 22 M330 44 L358 24" />
        <path d="M170 300 C120 330 96 372 92 424 M92 424 L60 452 M92 424 L124 456" />
        <path d="M392 300 C440 330 464 372 468 424 M468 424 L500 452 M468 424 L436 456" />
      </g>

      {/* heart silhouette */}
      <g className="animate-cl-pulse">
        <path
          d="M280 392c-8-6-96-64-124-124-20-42-10-92 30-112 32-16 68-4 90 24 22-28 58-40 90-24 40 20 50 70 30 112-28 60-116 118-116 124z"
          fill="url(#cl-heart)"
          stroke="url(#cl-stroke)"
          strokeWidth="1.4"
        />
        <path
          d="M280 180c-10 34 14 52 6 84-6 24 6 40 14 58M236 196c14 26 4 48 12 70M330 200c-16 24-4 46-12 68"
          fill="none"
          stroke="var(--cyan)"
          strokeOpacity="0.55"
          strokeWidth="1"
        />
      </g>

      {/* blood flow */}
      <g fill="none" strokeWidth="1.6" strokeLinecap="round">
        <path
          d="M156 250c40-46 92-54 124-24"
          stroke="var(--cyan)"
          className="animate-cl-flow"
        />
        <path
          d="M404 250c-40-46-92-54-124-24"
          stroke="var(--crimson)"
          strokeOpacity="0.85"
          className="animate-cl-flow"
        />
        <path
          d="M200 356c46 34 114 34 160 0"
          stroke="var(--teal)"
          className="animate-cl-flow"
        />
      </g>

      {/* ecg trace */}
      <path
        d="M40 452h96l14-26 12 54 16-96 18 118 16-50h30l16 20h258"
        fill="none"
        stroke="var(--cyan)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="animate-cl-trace"
        opacity="0.9"
      />

      {/* particles */}
      <g fill="var(--cyan)" opacity="0.7">
        {[
          [96, 140],
          [452, 168],
          [130, 380],
          [430, 356],
          [340, 96],
          [200, 92],
          [500, 260],
          [64, 268],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 2.4 : 1.4}
            className="animate-cl-drift"
            style={{ animationDelay: `${i * 0.7}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

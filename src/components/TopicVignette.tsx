"use client";

export function TopicVignette({
  kind,
}: {
  kind: "volcano" | "oceanWaves";
}) {
  if (kind === "oceanWaves") {
    return (
      <div className="topic-vignette wave-vignette" aria-hidden="true">
        <svg viewBox="0 0 220 80" role="img">
          <path
            className="wave-line wave-1"
            d="M0 40 C20 20, 40 20, 60 40 S100 60, 120 40 S160 20, 180 40 S200 60, 220 40"
          />
          <path
            className="wave-line wave-2"
            d="M0 50 C20 30, 40 30, 60 50 S100 70, 120 50 S160 30, 180 50 S200 70, 220 50"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="topic-vignette" aria-hidden="true">
      <svg viewBox="0 0 120 120" role="img">
        <defs>
          <linearGradient id="lavaGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="rockShade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#0b0f1d" />
          </linearGradient>
        </defs>
        <path
          className="volcano-body"
          d="M20 94 L52 40 L68 40 L100 94 Z"
          fill="url(#rockShade)"
        />
        <path
          className="volcano-rim"
          d="M48 46 Q60 36 72 46"
          stroke="#334155"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          className="lava-flow"
          d="M60 46 C58 60 62 72 58 92"
          stroke="url(#lavaGlow)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <circle className="lava-burst lava-1" cx="60" cy="30" r="6" />
        <circle className="lava-burst lava-2" cx="42" cy="34" r="4" />
        <circle className="lava-burst lava-3" cx="78" cy="34" r="4" />
        <circle className="ash ash-1" cx="50" cy="18" r="5" />
        <circle className="ash ash-2" cx="70" cy="14" r="4" />
      </svg>
    </div>
  );
}

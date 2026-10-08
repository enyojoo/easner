import type { ReactNode } from "react"

/**
 * Small illustrations for the "Why choose Easner" pillars. Drawn on a 240 × 140 canvas in the design
 * system's palette only: Easner blue for the one thing that matters, graphite ink, ivory plates and
 * hairlines. Decorative; each card's title and text carry the meaning.
 */
const BLUE = "var(--brand-primary)"
const TINT = "var(--surface-tint)"
const INK = "var(--web-ink)"
const PLATE = "var(--web-canvas)"
const BAND = "var(--web-band)"
const LINE = "var(--web-hairline)"
const META = "var(--brand-stone)"

/** An account in your name: account details with the holder's name, and three currency coins. */
function AccountArt() {
  return (
    <>
      <rect x="34" y="22" width="150" height="96" rx="14" fill={PLATE} stroke={LINE} strokeWidth="1.5" />
      <circle cx="56" cy="44" r="9" fill={TINT} />
      <path d="M52 44.5l3 3 5.5-6" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="72" y="38" width="62" height="7" rx="3.5" fill={INK} />
      <rect x="72" y="49" width="40" height="5" rx="2.5" fill={META} />
      <rect x="48" y="70" width="56" height="5" rx="2.5" fill={META} />
      <rect x="48" y="80" width="88" height="7" rx="3.5" fill={INK} opacity="0.85" />
      <rect x="48" y="96" width="56" height="5" rx="2.5" fill={META} />
      {[
        { cx: 170, label: "$", fill: BLUE, text: "white" },
        { cx: 194, label: "€", fill: INK, text: "white" },
        { cx: 218, label: "£", fill: PLATE, text: INK },
      ].map((coin, i) => (
        <g key={coin.label}>
          <circle cx={coin.cx} cy={104 - i * 0} r="16" fill={coin.fill} stroke={i === 2 ? LINE : PLATE} strokeWidth="2.5" />
          <text x={coin.cx} y="109.5" textAnchor="middle" fontSize="15" fontWeight="700" fill={coin.text} fontFamily="var(--font-sans)">
            {coin.label}
          </text>
        </g>
      ))}
    </>
  )
}

/** Reach 80+ countries: a dotted globe with payout arcs leaving one origin. */
function ReachArt() {
  const dots: ReactNode[] = []
  for (let row = 0; row < 9; row++) {
    const y = 26 + row * 11
    const half = Math.round(Math.sqrt(Math.max(0, 1 - ((y - 70) / 50) ** 2)) * 50)
    for (let x = 120 - half; x <= 120 + half; x += 11) {
      dots.push(<circle key={`${row}-${x}`} cx={x} cy={y} r="1.8" fill={META} />)
    }
  }
  const targets: [number, number][] = [
    [72, 52],
    [96, 98],
    [150, 40],
    [166, 92],
  ]
  return (
    <>
      <circle cx="120" cy="70" r="54" fill={BAND} />
      {dots}
      {targets.map(([x, y]) => (
        <g key={`${x}${y}`}>
          <path d={`M120 70 Q ${(120 + x) / 2} ${Math.min(70, y) - 26} ${x} ${y}`} stroke={BLUE} strokeWidth="1.75" fill="none" strokeDasharray="3 3" />
          <circle cx={x} cy={y} r="5" fill={PLATE} stroke={BLUE} strokeWidth="2" />
        </g>
      ))}
      <circle cx="120" cy="70" r="8" fill={BLUE} />
      <circle cx="120" cy="70" r="14" fill="none" stroke={BLUE} strokeOpacity="0.25" strokeWidth="2" />
    </>
  )
}

/** Money that moves fast: a payment travelling along a track, from sent to arrived. */
function SpeedArt() {
  return (
    <>
      <rect x="22" y="46" width="196" height="48" rx="24" fill={BAND} />
      <path d="M44 70 H196" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <path d="M44 70 H150" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
      <circle cx="44" cy="70" r="7" fill={BLUE} />
      <g transform="translate(150 70)">
        <circle r="17" fill={BLUE} />
        <path d="M-6 0 H6 M1 -5 L6 0 L1 5" stroke="white" strokeWidth="2.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx="196" cy="70" r="9" fill={PLATE} stroke={LINE} strokeWidth="2" />
      <path d="M192 70.5l3 3 5-6" stroke={META} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(120 112)">
        <circle r="13" fill={PLATE} stroke={LINE} strokeWidth="1.5" />
        <path d="M0 -6 V0 L4 3" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </>
  )
}

/** Dollars or stablecoins: a dollar balance and a stablecoin side by side, with a two-way exchange. */
function StablecoinArt() {
  return (
    <>
      <g transform="translate(78 70)">
        <circle r="34" fill={PLATE} stroke={LINE} strokeWidth="1.5" />
        <circle r="25" fill={TINT} />
        <text y="8" textAnchor="middle" fontSize="24" fontWeight="700" fill={BLUE} fontFamily="var(--font-sans)">
          $
        </text>
      </g>
      <g transform="translate(162 70)">
        <circle r="34" fill={BLUE} />
        <circle r="25" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="4 4" />
        <text y="8" textAnchor="middle" fontSize="24" fontWeight="700" fill="white" fontFamily="var(--font-sans)">
          $
        </text>
      </g>
      <path d="M108 48 Q120 38 132 48" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M128 43 L132 48 L126 50" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M132 92 Q120 102 108 92" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M112 97 L108 92 L114 90" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

const ART: Record<string, () => ReactNode> = {
  "pillar-account": AccountArt,
  "pillar-reach": ReachArt,
  "pillar-speed": SpeedArt,
  "pillar-stablecoin": StablecoinArt,
}

export function PillarArt({ id, className }: { id: string; className?: string }) {
  const Art = ART[id]
  if (!Art) return null
  return (
    <svg viewBox="0 0 240 140" className={className} aria-hidden="true" focusable="false">
      <Art />
    </svg>
  )
}

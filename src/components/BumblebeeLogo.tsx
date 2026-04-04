export default function BumblebeeLogo({
  className = "",
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bumblebee Berries logo"
    >
      {/* Honeycomb hex background */}
      <circle cx="32" cy="32" r="30" fill="#fde68a" />
      <circle cx="32" cy="32" r="30" fill="url(#hexGrad)" />

      {/* Bee body */}
      <ellipse cx="32" cy="34" rx="13" ry="9" fill="#fbbf24" />
      {/* Bee stripes */}
      <rect x="22" y="29" width="20" height="4" rx="2" fill="#1c1917" opacity="0.7" />
      <rect x="22" y="35" width="20" height="4" rx="2" fill="#1c1917" opacity="0.7" />

      {/* Bee head */}
      <circle cx="43" cy="33" r="5" fill="#fbbf24" />
      <circle cx="45" cy="31" r="1.2" fill="#1c1917" />

      {/* Wings */}
      <ellipse cx="29" cy="24" rx="9" ry="5" fill="white" opacity="0.75" transform="rotate(-10 29 24)" />
      <ellipse cx="36" cy="23" rx="8" ry="4.5" fill="white" opacity="0.75" transform="rotate(8 36 23)" />

      {/* Stinger */}
      <path d="M19 34 Q15 34 13 33 Q15 32 19 33Z" fill="#92400e" />

      {/* Antennae */}
      <line x1="43" y1="29" x2="46" y2="23" stroke="#1c1917" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="46" cy="22" r="1.5" fill="#1c1917" />
      <line x1="45" y1="28" x2="50" y2="24" stroke="#1c1917" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="51" cy="23" r="1.5" fill="#1c1917" />

      {/* Berry cluster */}
      <circle cx="24" cy="46" r="5" fill="#db2777" />
      <circle cx="32" cy="44" r="5" fill="#be185d" />
      <circle cx="28" cy="52" r="5" fill="#ec4899" />
      <circle cx="24" cy="46" r="1.5" fill="#fce7f3" opacity="0.6" />
      <circle cx="32" cy="44" r="1.5" fill="#fce7f3" opacity="0.6" />
      <circle cx="28" cy="52" r="1.5" fill="#fce7f3" opacity="0.6" />
      {/* Leaf */}
      <path d="M28 40 Q30 36 34 38 Q32 42 28 40Z" fill="#16a34a" />

      <defs>
        <radialGradient id="hexGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

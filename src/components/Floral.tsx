import { cn } from "@/lib/utils";

/** Small botanical sprig used as a subtle decorative accent. */
export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={cn("pointer-events-none", className)} aria-hidden>
      <path
        d="M60 115C60 80 52 44 26 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${52 - i * 6} ${96 - i * 18}) rotate(${-24 - i * 6})`}>
          <ellipse rx="15" ry="6.5" cx="-13" cy="0" fill="currentColor" opacity={0.22 + i * 0.05} />
          <ellipse rx="15" ry="6.5" cx="13" cy="-4" fill="currentColor" opacity={0.16 + i * 0.05} />
        </g>
      ))}
    </svg>
  );
}

/** Five-petal blossom accent. */
export function Blossom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={cn("pointer-events-none", className)} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse
          key={i}
          cx="50"
          cy="28"
          rx="13"
          ry="21"
          fill="currentColor"
          opacity="0.35"
          transform={`rotate(${i * 72} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.65" />
    </svg>
  );
}

/** Corner decoration for hero/section surfaces. */
export function FloralCorner({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute select-none", className)} aria-hidden>
      <Blossom className="absolute -right-4 -top-6 h-28 w-28 text-petal animate-sway" />
      <Sprig className="absolute right-16 -top-2 h-40 w-40 text-leaf" />
      <Blossom className="absolute right-28 top-16 h-14 w-14 text-primary/70" />
    </div>
  );
}

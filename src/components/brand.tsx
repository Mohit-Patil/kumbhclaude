import Link from "next/link";

// The mark: two streams (saffron + marigold) meeting into one — the Sangam
// confluence, and the reunification idea. Saffron/marigold live ONLY here and
// in the identity band (constraint 2).
export function Mark({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 44 44" className="mark" width={size} height={size} aria-hidden>
      <rect width="44" height="44" rx="12" fill="#1A1A1A" />
      <path d="M13 11 C 17 21, 20 21.5, 22 26" stroke="#E8821E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M31 11 C 27 21, 24 21.5, 22 26" stroke="#F2A310" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M22 26 L22 34" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="35.2" r="1.9" fill="#fff" />
    </svg>
  );
}

// Shared identity lockup. `home=false` renders a plain element (kiosk screens
// must not link back to home).
export function Brand({ size = 44, home = true }: { size?: number; home?: boolean }) {
  const inner = (
    <>
      <Mark size={size} />
      <div className="name">
        <span className="dev">पुनर्मिलन</span>
        <small>Punarmilan · खोया–पाया · Khoya–Paya</small>
      </div>
    </>
  );
  if (!home) return <div className="brand" aria-label="Punarmilan">{inner}</div>;
  return (
    <Link href="/" className="brand" aria-label="Punarmilan home">
      {inner}
    </Link>
  );
}

// Neutral face placeholder for records without a photo.
export function Silhouette({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#475569" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

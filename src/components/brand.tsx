import Link from "next/link";

export function Mark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" className="mark" width={size} height={size} aria-hidden>
      <rect width="40" height="40" rx="11" fill="#0E7C6B" />
      <path
        d="M11.5 10 C 15 19, 18 19.5, 20 24"
        stroke="#D33A2C"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M28.5 10 C 25 19, 22 19.5, 20 24"
        stroke="#F2A310"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M20 24 L20 31.5" stroke="#fff" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="32.5" r="1.7" fill="#fff" />
    </svg>
  );
}

export function Brand() {
  return (
    <div className="brand">
      <Mark />
      <div className="name">
        पुनर्मिलन
        <small>Punarmilan · Khoya–Paya</small>
      </div>
    </div>
  );
}

export function Silhouette({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#8A9690" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export function AgentBand({
  title,
  titleHi,
}: {
  title: string;
  titleHi: string;
}) {
  return (
    <header className="band">
      <div className="left">
        <Link href="/" className="brand" aria-label="Punarmilan home">
          <Mark size={36} />
          <div className="name">
            पुनर्मिलन<small>Punarmilan</small>
          </div>
        </Link>
        <span className="titlechip">
          {title} · <span className="hi">{titleHi}</span>
        </span>
      </div>
      <div className="ctx">
        <div className="cell">
          <div className="k">Booth</div>
          <div className="v mono">K-14 · Sector 8</div>
        </div>
        <div className="cell">
          <div className="k">Shift time</div>
          <div className="v mono">14:08 · Day 6</div>
        </div>
        <div className="duty">
          <div className="cell" style={{ textAlign: "right" }}>
            <div className="k">Agent on duty</div>
            <div className="v">Meena Sharma</div>
          </div>
          <div className="av">MS</div>
        </div>
      </div>
    </header>
  );
}
